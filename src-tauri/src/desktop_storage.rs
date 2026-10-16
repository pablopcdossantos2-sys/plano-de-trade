use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use serde_json::Value;
use std::{
    fs,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager};

// Nome legado preservado para manter o mesmo banco após o rebranding.
const DB_FILE: &str = "plano-de-trade.sqlite3";
const DEFAULT_BACKUP_FOLDER: &str = "backups";
const AUTO_BACKUP_LIMIT: usize = 10;
const SAFETY_BACKUP_LIMIT: usize = 5;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IntegrityInfo {
    pub ok: bool,
    pub message: String,
    pub database_path: String,
    pub backup_directory: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopSaveResult {
    pub saved: bool,
    pub backup_warning: Option<String>,
}

fn timestamp() -> Result<u64, String> {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_secs())
        .map_err(|error| format!("Relógio do sistema inválido: {error}"))
}

fn app_data_dir(app: &AppHandle) -> Result<PathBuf, String> {
    let dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Não foi possível localizar a pasta de dados: {error}"))?;
    fs::create_dir_all(&dir)
        .map_err(|error| format!("Não foi possível criar a pasta de dados: {error}"))?;
    Ok(dir)
}

fn db_path(app: &AppHandle) -> Result<PathBuf, String> {
    Ok(app_data_dir(app)?.join(DB_FILE))
}

fn open_db(app: &AppHandle) -> Result<Connection, String> {
    let path = db_path(app)?;
    let connection = Connection::open(&path)
        .map_err(|error| format!("Não foi possível abrir o banco SQLite: {error}"))?;
    connection
        .execute_batch(
            "
            PRAGMA journal_mode = WAL;
            PRAGMA foreign_keys = ON;
            CREATE TABLE IF NOT EXISTS app_state (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                json TEXT NOT NULL,
                updated_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS app_config (
                key TEXT PRIMARY KEY,
                value TEXT NOT NULL
            );
            ",
        )
        .map_err(|error| format!("Não foi possível preparar o banco SQLite: {error}"))?;
    Ok(connection)
}

fn validate_state_json(state_json: &str) -> Result<(), String> {
    let value: Value = serde_json::from_str(state_json)
        .map_err(|error| format!("Estado JSON inválido: {error}"))?;
    let schema = value
        .get("schemaVersion")
        .and_then(Value::as_u64)
        .ok_or_else(|| "O estado não contém schemaVersion válido.".to_string())?;
    if schema == 0 {
        return Err("schemaVersion não pode ser zero.".to_string());
    }
    Ok(())
}

fn get_config(connection: &Connection, key: &str) -> Result<Option<String>, String> {
    connection
        .query_row(
            "SELECT value FROM app_config WHERE key = ?1",
            params![key],
            |row| row.get::<_, String>(0),
        )
        .optional()
        .map_err(|error| format!("Não foi possível ler a configuração {key}: {error}"))
}

fn set_config(connection: &Connection, key: &str, value: &str) -> Result<(), String> {
    connection
        .execute(
            "INSERT INTO app_config(key, value) VALUES(?1, ?2)
             ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            params![key, value],
        )
        .map_err(|error| format!("Não foi possível salvar a configuração {key}: {error}"))?;
    Ok(())
}

fn backup_directory_internal(app: &AppHandle, connection: &Connection) -> Result<PathBuf, String> {
    if let Some(configured) = get_config(connection, "backup_directory")? {
        let path = PathBuf::from(configured);
        fs::create_dir_all(&path)
            .map_err(|error| format!("Não foi possível acessar a pasta de backup: {error}"))?;
        return Ok(path);
    }
    let path = app_data_dir(app)?.join(DEFAULT_BACKUP_FOLDER);
    fs::create_dir_all(&path)
        .map_err(|error| format!("Não foi possível criar a pasta padrão de backup: {error}"))?;
    Ok(path)
}

fn load_state_from_connection(connection: &Connection) -> Result<Option<String>, String> {
    connection
        .query_row("SELECT json FROM app_state WHERE id = 1", [], |row| {
            row.get::<_, String>(0)
        })
        .optional()
        .map_err(|error| format!("Não foi possível ler o estado do banco: {error}"))
}

fn write_raw_backup_file(
    app: &AppHandle,
    connection: &Connection,
    state_json: &str,
    kind: &str,
) -> Result<String, String> {
    let directory = backup_directory_internal(app, connection)?;
    let stamp = timestamp()?;
    let path = directory.join(format!("trade-blueprint-{kind}-{stamp}.json"));
    fs::write(&path, state_json)
        .map_err(|error| format!("Não foi possível criar o backup: {error}"))?;
    Ok(path.to_string_lossy().to_string())
}

fn write_backup_file(
    app: &AppHandle,
    connection: &Connection,
    state_json: &str,
    kind: &str,
) -> Result<String, String> {
    validate_state_json(state_json)?;
    write_raw_backup_file(app, connection, state_json, kind)
}

fn rotate_backup_kind(directory: &Path, kind: &str, limit: usize) -> Result<(), String> {
    let current_prefix = format!("trade-blueprint-{kind}-");
    let legacy_prefix = format!("plano-de-trade-{kind}-");
    let mut files: Vec<PathBuf> = fs::read_dir(directory)
        .map_err(|error| format!("Não foi possível listar os backups: {error}"))?
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|path| {
            path.file_name()
                .and_then(|name| name.to_str())
                .map(|name| {
                    (name.starts_with(&current_prefix) || name.starts_with(&legacy_prefix))
                        && name.ends_with(".json")
                })
                .unwrap_or(false)
        })
        .collect();

    files.sort();
    if files.len() > limit {
        let remove_count = files.len() - limit;
        for path in files.into_iter().take(remove_count) {
            fs::remove_file(&path).map_err(|error| {
                format!(
                    "Não foi possível remover o backup antigo {}: {error}",
                    path.to_string_lossy()
                )
            })?;
        }
    }
    Ok(())
}

fn maybe_create_automatic_backup(
    app: &AppHandle,
    connection: &Connection,
    state_json: &str,
    local_day: Option<&str>,
) -> Result<(), String> {
    let current_marker = local_day
        .filter(|value| {
            value.len() == 10
                && value.as_bytes()[4] == b'-'
                && value.as_bytes()[7] == b'-'
                && value
                    .chars()
                    .enumerate()
                    .all(|(index, ch)| index == 4 || index == 7 || ch.is_ascii_digit())
        })
        .map(str::to_string)
        .unwrap_or_else(|| (timestamp().unwrap_or_default() / 86_400).to_string());
    if get_config(connection, "last_auto_backup_day")?.as_deref() == Some(current_marker.as_str()) {
        return Ok(());
    }

    write_backup_file(app, connection, state_json, "auto")?;
    let directory = backup_directory_internal(app, connection)?;
    rotate_backup_kind(&directory, "auto", AUTO_BACKUP_LIMIT)?;
    set_config(connection, "last_auto_backup_day", &current_marker)?;
    Ok(())
}

fn save_state_internal(
    app: &AppHandle,
    connection: &Connection,
    state_json: &str,
    make_auto_backup: bool,
    local_day: Option<&str>,
) -> Result<Option<String>, String> {
    validate_state_json(state_json)?;
    let stamp = timestamp()?;
    connection
        .execute(
            "INSERT INTO app_state(id, json, updated_at) VALUES(1, ?1, ?2)
             ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at",
            params![state_json, stamp as i64],
        )
        .map_err(|error| format!("Não foi possível salvar o estado no SQLite: {error}"))?;

    let backup_warning = if make_auto_backup {
        maybe_create_automatic_backup(app, connection, state_json, local_day).err()
    } else {
        None
    };
    Ok(backup_warning)
}

#[tauri::command]
pub fn load_desktop_state(app: AppHandle) -> Result<Option<String>, String> {
    let connection = open_db(&app)?;
    load_state_from_connection(&connection)
}

#[tauri::command]
pub fn save_desktop_state(
    app: AppHandle,
    state_json: String,
    local_day: Option<String>,
) -> Result<DesktopSaveResult, String> {
    let connection = open_db(&app)?;
    let backup_warning =
        save_state_internal(&app, &connection, &state_json, true, local_day.as_deref())?;
    Ok(DesktopSaveResult {
        saved: true,
        backup_warning,
    })
}

#[tauri::command]
pub fn get_backup_directory(app: AppHandle) -> Result<String, String> {
    let connection = open_db(&app)?;
    Ok(backup_directory_internal(&app, &connection)?
        .to_string_lossy()
        .to_string())
}

#[tauri::command]
pub fn set_backup_directory(app: AppHandle, path: String) -> Result<String, String> {
    if path.trim().is_empty() {
        return Err("A pasta de backup não pode ficar vazia.".to_string());
    }
    let directory = PathBuf::from(path.trim());
    fs::create_dir_all(&directory)
        .map_err(|error| format!("Não foi possível criar/acessar a pasta escolhida: {error}"))?;

    let test_path = directory.join(".trade-blueprint-write-test");
    fs::write(&test_path, b"ok")
        .map_err(|error| format!("A pasta escolhida não permite gravação: {error}"))?;
    let _ = fs::remove_file(test_path);

    let connection = open_db(&app)?;
    set_config(
        &connection,
        "backup_directory",
        &directory.to_string_lossy(),
    )?;
    set_config(&connection, "last_auto_backup_day", "")?;
    Ok(directory.to_string_lossy().to_string())
}

#[tauri::command]
pub fn create_desktop_backup(app: AppHandle) -> Result<String, String> {
    let connection = open_db(&app)?;
    let state = load_state_from_connection(&connection)?
        .ok_or_else(|| "Ainda não existe estado salvo no banco desktop.".to_string())?;
    write_backup_file(&app, &connection, &state, "manual")
}

#[tauri::command]
pub fn preview_desktop_backup(path: String) -> Result<String, String> {
    let incoming = fs::read_to_string(PathBuf::from(path.trim()))
        .map_err(|error| format!("Não foi possível ler o backup selecionado: {error}"))?;
    validate_state_json(&incoming)?;
    Ok(incoming)
}

#[tauri::command]
pub fn restore_desktop_backup(app: AppHandle, path: String) -> Result<String, String> {
    let connection = open_db(&app)?;
    let incoming = fs::read_to_string(PathBuf::from(path.trim()))
        .map_err(|error| format!("Não foi possível ler o backup selecionado: {error}"))?;
    validate_state_json(&incoming)?;

    if let Some(current) = load_state_from_connection(&connection)? {
        write_raw_backup_file(&app, &connection, &current, "pre-restore")?;
        let directory = backup_directory_internal(&app, &connection)?;
        rotate_backup_kind(&directory, "pre-restore", SAFETY_BACKUP_LIMIT)?;
    }

    let _ = save_state_internal(&app, &connection, &incoming, false, None)?;
    Ok(incoming)
}

#[tauri::command]
pub fn check_desktop_integrity(app: AppHandle) -> Result<IntegrityInfo, String> {
    let connection = open_db(&app)?;
    let quick_check: String = connection
        .query_row("PRAGMA quick_check", [], |row| row.get(0))
        .map_err(|error| format!("Falha ao executar PRAGMA quick_check: {error}"))?;

    let state = load_state_from_connection(&connection)?;
    if let Some(json) = state.as_deref() {
        validate_state_json(json)?;
    }

    let ok = quick_check.eq_ignore_ascii_case("ok");
    Ok(IntegrityInfo {
        ok,
        message: if ok {
            "Banco SQLite e estado JSON íntegros.".to_string()
        } else {
            format!("SQLite retornou: {quick_check}")
        },
        database_path: db_path(&app)?.to_string_lossy().to_string(),
        backup_directory: backup_directory_internal(&app, &connection)?
            .to_string_lossy()
            .to_string(),
    })
}

pub fn create_pre_update_backup(app: &AppHandle) -> Result<Option<String>, String> {
    let connection = open_db(app)?;
    let Some(state) = load_state_from_connection(&connection)? else {
        return Ok(None);
    };
    let path = write_backup_file(app, &connection, &state, "pre-update")?;
    let directory = backup_directory_internal(app, &connection)?;
    rotate_backup_kind(&directory, "pre-update", SAFETY_BACKUP_LIMIT)?;
    Ok(Some(path))
}

#[cfg(test)]
mod tests {
    use super::{rotate_backup_kind, validate_state_json};
    use std::{fs, path::PathBuf, time::{SystemTime, UNIX_EPOCH}};

    fn temp_backup_dir(label: &str) -> PathBuf {
        let nanos = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .expect("clock")
            .as_nanos();
        let path = std::env::temp_dir().join(format!(
            "trade-blueprint-{label}-{}-{nanos}",
            std::process::id()
        ));
        fs::create_dir_all(&path).expect("create temp dir");
        path
    }

    #[test]
    fn rotates_only_the_requested_backup_kind() {
        let directory = temp_backup_dir("rotation");

        for index in 0..7 {
            fs::write(
                directory.join(format!("trade-blueprint-pre-update-{index:02}.json")),
                b"{}",
            )
            .expect("write pre-update");
        }
        fs::write(directory.join("trade-blueprint-manual-00.json"), b"{}")
            .expect("write manual");

        rotate_backup_kind(&directory, "pre-update", 5).expect("rotate");

        let names: Vec<String> = fs::read_dir(&directory)
            .expect("read dir")
            .filter_map(Result::ok)
            .filter_map(|entry| entry.file_name().to_str().map(str::to_string))
            .collect();

        assert_eq!(
            names.iter().filter(|name| name.contains("pre-update")).count(),
            5
        );
        assert!(names.iter().any(|name| name == "trade-blueprint-manual-00.json"));

        fs::remove_dir_all(directory).expect("cleanup");
    }

    #[test]
    fn validates_schema_version() {
        assert!(validate_state_json(r#"{"schemaVersion":8}"#).is_ok());
        assert!(validate_state_json(r#"{"value":1}"#).is_err());
        assert!(validate_state_json("not json").is_err());
    }
}

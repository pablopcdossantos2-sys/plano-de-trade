use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use serde_json::Value;
use std::{
    fs,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager};

const DB_FILE: &str = "plano-de-trade.sqlite3";
const DEFAULT_BACKUP_FOLDER: &str = "backups";
const AUTO_BACKUP_LIMIT: usize = 10;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct IntegrityInfo {
    pub ok: bool,
    pub message: String,
    pub database_path: String,
    pub backup_directory: String,
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

fn write_backup_file(
    app: &AppHandle,
    connection: &Connection,
    state_json: &str,
    kind: &str,
) -> Result<String, String> {
    validate_state_json(state_json)?;
    let directory = backup_directory_internal(app, connection)?;
    let stamp = timestamp()?;
    let path = directory.join(format!("plano-de-trade-{kind}-{stamp}.json"));
    fs::write(&path, state_json)
        .map_err(|error| format!("Não foi possível criar o backup: {error}"))?;
    Ok(path.to_string_lossy().to_string())
}

fn rotate_automatic_backups(directory: &Path) -> Result<(), String> {
    let mut files: Vec<PathBuf> = fs::read_dir(directory)
        .map_err(|error| format!("Não foi possível listar os backups: {error}"))?
        .filter_map(Result::ok)
        .map(|entry| entry.path())
        .filter(|path| {
            path.file_name()
                .and_then(|name| name.to_str())
                .map(|name| name.starts_with("plano-de-trade-auto-") && name.ends_with(".json"))
                .unwrap_or(false)
        })
        .collect();
    files.sort();
    if files.len() > AUTO_BACKUP_LIMIT {
        let remove_count = files.len() - AUTO_BACKUP_LIMIT;
        for path in files.into_iter().take(remove_count) {
            let _ = fs::remove_file(path);
        }
    }
    Ok(())
}

fn maybe_create_automatic_backup(
    app: &AppHandle,
    connection: &Connection,
    state_json: &str,
) -> Result<(), String> {
    let day = timestamp()? / 86_400;
    let current_marker = day.to_string();
    if get_config(connection, "last_auto_backup_day")?.as_deref() == Some(current_marker.as_str()) {
        return Ok(());
    }

    write_backup_file(app, connection, state_json, "auto")?;
    let directory = backup_directory_internal(app, connection)?;
    rotate_automatic_backups(&directory)?;
    set_config(connection, "last_auto_backup_day", &current_marker)?;
    Ok(())
}

fn save_state_internal(
    app: &AppHandle,
    connection: &Connection,
    state_json: &str,
    make_auto_backup: bool,
) -> Result<(), String> {
    validate_state_json(state_json)?;
    let stamp = timestamp()?;
    connection
        .execute(
            "INSERT INTO app_state(id, json, updated_at) VALUES(1, ?1, ?2)
             ON CONFLICT(id) DO UPDATE SET json = excluded.json, updated_at = excluded.updated_at",
            params![state_json, stamp as i64],
        )
        .map_err(|error| format!("Não foi possível salvar o estado no SQLite: {error}"))?;

    if make_auto_backup {
        maybe_create_automatic_backup(app, connection, state_json)?;
    }
    Ok(())
}

#[tauri::command]
pub fn load_desktop_state(app: AppHandle) -> Result<Option<String>, String> {
    let connection = open_db(&app)?;
    load_state_from_connection(&connection)
}

#[tauri::command]
pub fn save_desktop_state(app: AppHandle, state_json: String) -> Result<bool, String> {
    let connection = open_db(&app)?;
    save_state_internal(&app, &connection, &state_json, true)?;
    Ok(true)
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

    let test_path = directory.join(".plano-de-trade-write-test");
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
pub fn restore_desktop_backup(app: AppHandle, path: String) -> Result<String, String> {
    let connection = open_db(&app)?;
    let incoming = fs::read_to_string(PathBuf::from(path.trim()))
        .map_err(|error| format!("Não foi possível ler o backup selecionado: {error}"))?;
    validate_state_json(&incoming)?;

    if let Some(current) = load_state_from_connection(&connection)? {
        let _ = write_backup_file(&app, &connection, &current, "pre-restore");
    }

    save_state_internal(&app, &connection, &incoming, false)?;
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
    write_backup_file(app, &connection, &state, "pre-update").map(Some)
}

#[cfg(test)]
mod tests {
    use super::validate_state_json;

    #[test]
    fn validates_schema_version() {
        assert!(validate_state_json(r#"{"schemaVersion":7}"#).is_ok());
        assert!(validate_state_json(r#"{"value":1}"#).is_err());
        assert!(validate_state_json("not json").is_err());
    }
}

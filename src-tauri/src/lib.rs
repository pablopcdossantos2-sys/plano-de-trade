mod desktop_storage;
mod updates;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.unminimize();
                let _ = window.set_focus();
            }
        }))
        .setup(|app| {
            #[cfg(desktop)]
            if updates::plugin_enabled() {
                app.handle()
                    .plugin(tauri_plugin_updater::Builder::new().build())?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            desktop_storage::load_desktop_state,
            desktop_storage::save_desktop_state,
            desktop_storage::get_backup_directory,
            desktop_storage::set_backup_directory,
            desktop_storage::create_desktop_backup,
            desktop_storage::restore_desktop_backup,
            desktop_storage::check_desktop_integrity,
            updates::app_version,
            updates::check_update,
            updates::install_update,
        ])
        .run(tauri::generate_context!())
        .expect("erro fatal ao iniciar o Trade Blueprint");
}

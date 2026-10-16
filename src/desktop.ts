import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

export type DesktopUpdateInfo = {
  version: string;
  notes?: string | null;
  date?: string | null;
};

export type DesktopSaveResult = {
  saved: boolean;
  backupWarning?: string | null;
};

export type DesktopIntegrityInfo = {
  ok: boolean;
  message: string;
  databasePath: string;
  backupDirectory: string;
};

export function isDesktopApp() {
  return typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;
}

export async function desktopVersion() {
  if (!isDesktopApp()) return null;
  return invoke<string>("app_version");
}

export async function checkDesktopUpdate() {
  if (!isDesktopApp()) return null;
  return invoke<DesktopUpdateInfo | null>("check_update");
}

export async function installDesktopUpdate(version: string) {
  if (!isDesktopApp()) return false;
  return invoke<boolean>("install_update", { expectedVersion: version });
}

export async function loadDesktopState() {
  if (!isDesktopApp()) return null;
  return invoke<string | null>("load_desktop_state");
}

export async function saveDesktopState(stateJson: string, localDay: string) {
  if (!isDesktopApp()) return null;
  return invoke<DesktopSaveResult>("save_desktop_state", { stateJson, localDay });
}

export async function getDesktopBackupDirectory() {
  if (!isDesktopApp()) return null;
  return invoke<string>("get_backup_directory");
}

export async function setDesktopBackupDirectory(path: string) {
  if (!isDesktopApp()) return null;
  return invoke<string>("set_backup_directory", { path });
}

export async function createDesktopBackup() {
  if (!isDesktopApp()) return null;
  return invoke<string>("create_desktop_backup");
}

export async function previewDesktopBackup(path: string) {
  if (!isDesktopApp()) return null;
  return invoke<string>("preview_desktop_backup", { path });
}

export async function restoreDesktopBackup(path: string) {
  if (!isDesktopApp()) return null;
  return invoke<string>("restore_desktop_backup", { path });
}

export async function checkDesktopIntegrity() {
  if (!isDesktopApp()) return null;
  return invoke<DesktopIntegrityInfo>("check_desktop_integrity");
}

export async function chooseDesktopBackupDirectory() {
  if (!isDesktopApp()) return null;
  const selected = await open({
    directory: true,
    multiple: false,
    title: "Escolher pasta de backup",
  });
  return typeof selected === "string" ? selected : null;
}

export async function chooseDesktopBackupFile() {
  if (!isDesktopApp()) return null;
  const selected = await open({
    multiple: false,
    title: "Restaurar backup do Trade Blueprint",
    filters: [{ name: "Backup JSON", extensions: ["json"] }],
  });
  return typeof selected === "string" ? selected : null;
}

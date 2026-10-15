import { invoke } from "@tauri-apps/api/core";

export type DesktopUpdateInfo = {
  version: string;
  notes?: string | null;
  date?: string | null;
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

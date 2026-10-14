import { z } from "zod";
import type { AppState } from "./types";

export const CURRENT_SCHEMA_VERSION = 1;
export const STORAGE_KEY = "plano-de-trade-data-v1";

const attachmentSchema = z.object({
  id: z.string(),
  name: z.string().max(200),
  dataUrl: z.string(),
  createdAt: z.string(),
});

const scenarioSchema = z.object({
  id: z.string(),
  label: z.enum(["A", "B", "C"]),
  title: z.string(),
  trigger: z.string(),
  confirmation: z.string(),
  action: z.string(),
  invalidation: z.string(),
  stop: z.string(),
  targets: z.string(),
  avoid: z.string(),
});

const stateSchema = z.object({
  schemaVersion: z.number().int().min(1).max(CURRENT_SCHEMA_VERSION),
  rules: z.array(z.object({
    id: z.string(),
    title: z.string(),
    category: z.enum(["Entrada", "Saída", "Risco", "Horário", "Contexto", "Comportamento", "Outro"]),
    description: z.string(),
    rationale: z.string(),
    active: z.boolean(),
    attachments: z.array(attachmentSchema),
    createdAt: z.string(),
    updatedAt: z.string(),
  })),
  plans: z.array(z.object({
    id: z.string(),
    planDate: z.string(),
    tradingDate: z.string(),
    asset: z.string(),
    bias: z.enum(["Alta", "Baixa", "Neutro"]),
    marketContext: z.string(),
    keyLevels: z.string(),
    macroEvents: z.string(),
    maxRisk: z.string(),
    maxTrades: z.number().int().min(1),
    noTradeConditions: z.string(),
    checklist: z.array(z.string()),
    scenarios: z.array(scenarioSchema),
    behaviorPlan: z.string(),
    attachments: z.array(attachmentSchema),
    review: z.object({
      happened: z.string(),
      observedScenario: z.enum(["A", "B", "C", "Nenhum", "Mistura", ""]),
      followedPlan: z.enum(["Sim", "Parcialmente", "Não", "Não operei", ""]),
      deviations: z.string(),
      lessons: z.string(),
      result: z.string(),
      attachments: z.array(attachmentSchema),
      reviewedAt: z.string().optional(),
    }),
    createdAt: z.string(),
    updatedAt: z.string(),
  })),
  settings: z.object({
    traderName: z.string(),
    assets: z.array(z.string()),
    defaultMaxRisk: z.string(),
    defaultMaxTrades: z.number().int().min(1),
    theme: z.enum(["dark", "light"]),
    attachments: z.array(attachmentSchema),
  }),
  updatedAt: z.string(),
});

function now() {
  return new Date().toISOString();
}

export function initialState(): AppState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    rules: [],
    plans: [],
    settings: {
      traderName: "",
      assets: ["WINFUT", "WDOFUT", "DI1FUT", "EWZ"],
      defaultMaxRisk: "",
      defaultMaxTrades: 3,
      theme: "dark",
      attachments: [],
    },
    updatedAt: now(),
  };
}

export function loadState(): AppState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return initialState();
  try {
    const parsed = JSON.parse(saved) as unknown;
    const result = stateSchema.safeParse(parsed);
    return result.success ? result.data : initialState();
  } catch {
    return initialState();
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, updatedAt: now() }));
}

export function parseBackup(text: string): AppState {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("O arquivo selecionado não contém um JSON válido.");
  }
  const result = stateSchema.safeParse(data);
  if (!result.success) {
    const issue = result.error.issues[0];
    throw new Error(`Backup incompatível em ${issue.path.join(".") || "arquivo"}: ${issue.message}`);
  }
  return result.data;
}

export function exportBackup(state: AppState) {
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const blob = new Blob([
    JSON.stringify({ ...state, schemaVersion: CURRENT_SCHEMA_VERSION, exportedAt: now() }, null, 2),
  ], { type: "application/json;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = `plano-de-trade-backup-${stamp}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(href);
}

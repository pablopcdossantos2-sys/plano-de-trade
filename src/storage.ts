import { z } from "zod";
import type { AppState, TradePlan } from "./types";

export const CURRENT_SCHEMA_VERSION = 3;
// Mantemos a mesma chave para preservar os dados criados no MVP v1.
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

const ruleSchema = z.object({
  id: z.string(),
  title: z.string(),
  category: z.enum(["Entrada", "Saída", "Risco", "Horário", "Contexto", "Comportamento", "Outro"]),
  description: z.string(),
  rationale: z.string(),
  active: z.boolean(),
  attachments: z.array(attachmentSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const settingsV2Schema = z.object({
  traderName: z.string(),
  assets: z.array(z.string()),
  defaultMaxRisk: z.string(),
  defaultMaxTrades: z.number().int().min(1),
  theme: z.enum(["dark", "light"]),
  attachments: z.array(attachmentSchema),
});

const settingsSchema = settingsV2Schema.extend({
  language: z.enum(["pt-BR", "en", "es"]),
});

const reviewV1Schema = z.object({
  happened: z.string(),
  observedScenario: z.enum(["A", "B", "C", "Nenhum", "Mistura", ""]),
  followedPlan: z.enum(["Sim", "Parcialmente", "Não", "Não operei", ""]),
  deviations: z.string(),
  lessons: z.string(),
  result: z.string(),
  attachments: z.array(attachmentSchema),
  reviewedAt: z.string().optional(),
});

const planV1Schema = z.object({
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
  review: reviewV1Schema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

const legacyStateSchema = z.object({
  schemaVersion: z.literal(1),
  rules: z.array(ruleSchema),
  plans: z.array(planV1Schema),
  settings: settingsV2Schema,
  updatedAt: z.string(),
});

const setupSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  marketContext: z.string(),
  entryCriteria: z.string(),
  confirmation: z.string(),
  invalidation: z.string(),
  stopModel: z.string(),
  targetModel: z.string(),
  avoid: z.string(),
  behaviorNotes: z.string(),
  active: z.boolean(),
  attachments: z.array(attachmentSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const snapshotSchema = z.object({
  id: z.string(),
  version: z.number().int().min(1),
  frozenAt: z.string(),
  asset: z.string(),
  tradingDate: z.string(),
  bias: z.enum(["Alta", "Baixa", "Neutro"]),
  setupId: z.string().optional(),
  marketContext: z.string(),
  keyLevels: z.string(),
  macroEvents: z.string(),
  evidenceAgainstThesis: z.string(),
  maxRisk: z.string(),
  maxTrades: z.number().int().min(1),
  noTradeConditions: z.string(),
  checklist: z.array(z.string()),
  scenarios: z.array(scenarioSchema),
  behaviorPlan: z.string(),
  attachments: z.array(attachmentSchema),
});

const planV2Schema = z.object({
  id: z.string(),
  planDate: z.string(),
  tradingDate: z.string(),
  asset: z.string(),
  bias: z.enum(["Alta", "Baixa", "Neutro"]),
  setupId: z.string().optional(),
  marketContext: z.string(),
  keyLevels: z.string(),
  macroEvents: z.string(),
  evidenceAgainstThesis: z.string(),
  maxRisk: z.string(),
  maxTrades: z.number().int().min(1),
  noTradeConditions: z.string(),
  checklist: z.array(z.string()),
  scenarios: z.array(scenarioSchema),
  behaviorPlan: z.string(),
  attachments: z.array(attachmentSchema),
  planStatus: z.enum(["draft", "frozen"]),
  versions: z.array(snapshotSchema),
  review: z.object({
    happened: z.string(),
    observedScenario: z.enum(["A", "B", "C", "Nenhum", "Mistura", ""]),
    followedPlan: z.enum(["Sim", "Parcialmente", "Não", "Não operei", ""]),
    executionSummary: z.string(),
    deviations: z.string(),
    lessons: z.string(),
    result: z.string(),
    attachments: z.array(attachmentSchema),
    reviewedAt: z.string().optional(),
  }),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const stateV2Schema = z.object({
  schemaVersion: z.literal(2),
  rules: z.array(ruleSchema),
  setups: z.array(setupSchema),
  plans: z.array(planV2Schema),
  settings: settingsV2Schema,
  updatedAt: z.string(),
});

const stateSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  rules: z.array(ruleSchema),
  setups: z.array(setupSchema),
  plans: z.array(planV2Schema),
  settings: settingsSchema,
  updatedAt: z.string(),
});

function now() {
  return new Date().toISOString();
}

export function initialState(): AppState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    rules: [],
    setups: [],
    plans: [],
    settings: {
      traderName: "",
      assets: ["WINFUT", "WDOFUT", "DI1FUT", "EWZ"],
      defaultMaxRisk: "",
      defaultMaxTrades: 3,
      theme: "dark",
      language: "pt-BR",
      attachments: [],
    },
    updatedAt: now(),
  };
}

function migrateV1Plan(plan: z.infer<typeof planV1Schema>): TradePlan {
  return {
    ...plan,
    setupId: undefined,
    evidenceAgainstThesis: "",
    planStatus: "draft",
    versions: [],
    review: {
      ...plan.review,
      executionSummary: "",
    },
  };
}

function migrateState(data: unknown): AppState {
  const versionResult = z.object({ schemaVersion: z.number().int() }).safeParse(data);
  if (!versionResult.success) {
    throw new Error("Arquivo sem versão de schema reconhecível.");
  }

  if (versionResult.data.schemaVersion === CURRENT_SCHEMA_VERSION) {
    const current = stateSchema.safeParse(data);
    if (!current.success) {
      const issue = current.error.issues[0];
      throw new Error(`Dados incompatíveis em ${issue.path.join(".") || "arquivo"}: ${issue.message}`);
    }
    return current.data;
  }

  if (versionResult.data.schemaVersion === 2) {
    const legacy = stateV2Schema.safeParse(data);
    if (!legacy.success) {
      const issue = legacy.error.issues[0];
      throw new Error(`Backup v2 inválido em ${issue.path.join(".") || "arquivo"}: ${issue.message}`);
    }
    return {
      ...legacy.data,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      settings: { ...legacy.data.settings, language: "pt-BR" },
      updatedAt: now(),
    };
  }

  if (versionResult.data.schemaVersion === 1) {
    const legacy = legacyStateSchema.safeParse(data);
    if (!legacy.success) {
      const issue = legacy.error.issues[0];
      throw new Error(`Backup v1 inválido em ${issue.path.join(".") || "arquivo"}: ${issue.message}`);
    }
    return {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      rules: legacy.data.rules,
      setups: [],
      plans: legacy.data.plans.map(migrateV1Plan),
      settings: { ...legacy.data.settings, language: "pt-BR" },
      updatedAt: now(),
    };
  }

  throw new Error(`Versão de backup não suportada: ${versionResult.data.schemaVersion}.`);
}

export function loadState(): AppState {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return initialState();
  try {
    return migrateState(JSON.parse(saved) as unknown);
  } catch {
    return initialState();
  }
}

export function saveState(state: AppState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, schemaVersion: CURRENT_SCHEMA_VERSION, updatedAt: now() }));
}

export function parseBackup(text: string): AppState {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("O arquivo selecionado não contém um JSON válido.");
  }
  return migrateState(data);
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

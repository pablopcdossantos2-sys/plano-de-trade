import { z } from "zod";
import type { AppState } from "./types";

export const CURRENT_SCHEMA_VERSION = 8;
// Mantemos a mesma chave para preservar os dados criados desde o MVP inicial.
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

const reviewV5Schema = reviewV1Schema.extend({
  executionSummary: z.string(),
});

const reviewSchema = reviewV5Schema.extend({
  executionOrigin: z.enum(["", "Planejada", "Parcialmente planejada", "Improvisada"]),
  violatedRuleIds: z.array(z.string()),
  readingQuality: z.number().int().min(0).max(5),
  executionQuality: z.number().int().min(0).max(5),
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

const snapshotV4Schema = z.object({
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

const planV4Schema = z.object({
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
  versions: z.array(snapshotV4Schema),
  review: reviewV5Schema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

const checklistItemSchema = z.object({
  id: z.string(),
  text: z.string(),
  checked: z.boolean(),
});

const thesisConvictionSchema = z.enum(["", "Baixa", "Média", "Alta"]);

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
  checklist: z.array(checklistItemSchema),
  scenarios: z.array(scenarioSchema),
  behaviorPlan: z.string(),
  thesisConviction: thesisConvictionSchema,
  changeMindCondition: z.string(),
  readinessScore: z.number().int().min(0).max(100).optional(),
  readinessIssues: z.array(z.string()).optional(),
  attachments: z.array(attachmentSchema),
});

const planV5Schema = z.object({
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
  checklist: z.array(checklistItemSchema),
  scenarios: z.array(scenarioSchema),
  behaviorPlan: z.string(),
  thesisConviction: thesisConvictionSchema,
  changeMindCondition: z.string(),
  attachments: z.array(attachmentSchema),
  planStatus: z.enum(["draft", "frozen"]),
  versions: z.array(snapshotSchema),
  review: reviewV5Schema,
  createdAt: z.string(),
  updatedAt: z.string(),
});


const planV6Schema = z.object({
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
  checklist: z.array(checklistItemSchema),
  scenarios: z.array(scenarioSchema),
  behaviorPlan: z.string(),
  thesisConviction: thesisConvictionSchema,
  changeMindCondition: z.string(),
  attachments: z.array(attachmentSchema),
  planStatus: z.enum(["draft", "frozen"]),
  versions: z.array(snapshotSchema),
  review: reviewSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});


const planSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
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
  checklist: z.array(checklistItemSchema),
  scenarios: z.array(scenarioSchema),
  behaviorPlan: z.string(),
  thesisConviction: thesisConvictionSchema,
  changeMindCondition: z.string(),
  attachments: z.array(attachmentSchema),
  planStatus: z.enum(["draft", "frozen"]),
  versions: z.array(snapshotSchema),
  review: reviewSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
});

const planTemplateSchema = z.object({
  id: z.string(),
  title: z.string(),
  asset: z.string(),
  setupId: z.string().optional(),
  bias: z.enum(["Alta", "Baixa", "Neutro"]),
  thesisConviction: thesisConvictionSchema,
  marketContext: z.string(),
  keyLevels: z.string(),
  macroEvents: z.string(),
  evidenceAgainstThesis: z.string(),
  changeMindCondition: z.string(),
  maxRisk: z.string(),
  maxTrades: z.number().int().min(1),
  noTradeConditions: z.string(),
  checklist: z.array(checklistItemSchema),
  scenarios: z.array(scenarioSchema),
  behaviorPlan: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

const journalTradeSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  tradingDate: z.string(),
  asset: z.string(),
  side: z.string(),
  entryTime: z.string(),
  exitTime: z.string(),
  entryPrice: z.string(),
  exitPrice: z.string(),
  quantity: z.string(),
  result: z.string(),
  notes: z.string(),
  planId: z.string().optional(),
  sessionId: z.string().optional(),
  scenarioLabel: z.enum(["", "A", "B", "C"]),
  importSource: z.string(),
  importedAt: z.string(),
});

const trainingRecordSchema = z.object({
  id: z.string(),
  type: z.enum(["replay", "revisit", "error"]),
  planId: z.string().optional(),
  setupId: z.string().optional(),
  ruleId: z.string().optional(),
  prompt: z.string(),
  decisionNow: z.string(),
  interpretationNow: z.string(),
  comparisonNotes: z.string(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
});

const setupExampleSchema = z.object({
  id: z.string(),
  setupId: z.string(),
  planId: z.string(),
  classification: z.enum(["Correto", "Incorreto"]),
  notes: z.string(),
  createdAt: z.string(),
});

const studySchema = z.object({
  id: z.string(),
  title: z.string(),
  studyDate: z.string(),
  referenceDate: z.string(),
  asset: z.string(),
  timeframe: z.string(),
  bias: z.enum(["Alta", "Baixa", "Neutro"]),
  setupId: z.string().optional(),
  objective: z.string(),
  marketContext: z.string(),
  keyLevels: z.string(),
  macroEvents: z.string(),
  evidenceAgainstThesis: z.string(),
  scenarios: z.array(scenarioSchema),
  behaviorPlan: z.string(),
  conclusion: z.string(),
  lessons: z.string(),
  status: z.enum(["draft", "completed"]),
  attachments: z.array(attachmentSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
  completedAt: z.string().optional(),
});

const stateV2Schema = z.object({
  schemaVersion: z.literal(2),
  rules: z.array(ruleSchema),
  setups: z.array(setupSchema),
  plans: z.array(planV4Schema),
  settings: settingsV2Schema,
  updatedAt: z.string(),
});

const stateV3Schema = z.object({
  schemaVersion: z.literal(3),
  rules: z.array(ruleSchema),
  setups: z.array(setupSchema),
  plans: z.array(planV4Schema),
  settings: settingsSchema,
  updatedAt: z.string(),
});

const stateV4Schema = z.object({
  schemaVersion: z.literal(4),
  rules: z.array(ruleSchema),
  setups: z.array(setupSchema),
  plans: z.array(planV4Schema),
  studies: z.array(studySchema),
  settings: settingsSchema,
  updatedAt: z.string(),
});

const stateV5Schema = z.object({
  schemaVersion: z.literal(5),
  rules: z.array(ruleSchema),
  setups: z.array(setupSchema),
  plans: z.array(planV5Schema),
  planTemplates: z.array(planTemplateSchema),
  studies: z.array(studySchema),
  settings: settingsSchema,
  updatedAt: z.string(),
});

const stateV6Schema = z.object({
  schemaVersion: z.literal(6),
  rules: z.array(ruleSchema),
  setups: z.array(setupSchema),
  plans: z.array(planV6Schema),
  planTemplates: z.array(planTemplateSchema),
  studies: z.array(studySchema),
  settings: settingsSchema,
  updatedAt: z.string(),
});

const stateV7Schema = z.object({
  schemaVersion: z.literal(7),
  rules: z.array(ruleSchema),
  setups: z.array(setupSchema),
  plans: z.array(planSchema),
  planTemplates: z.array(planTemplateSchema),
  journalTrades: z.array(journalTradeSchema),
  studies: z.array(studySchema),
  settings: settingsSchema,
  updatedAt: z.string(),
});

const stateSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  rules: z.array(ruleSchema),
  setups: z.array(setupSchema),
  plans: z.array(planSchema),
  planTemplates: z.array(planTemplateSchema),
  journalTrades: z.array(journalTradeSchema),
  trainingRecords: z.array(trainingRecordSchema),
  setupExamples: z.array(setupExampleSchema),
  studies: z.array(studySchema),
  settings: settingsSchema,
  updatedAt: z.string(),
});

function now() {
  return new Date().toISOString();
}

function migratedChecklist(items: string[]) {
  return items.map((text) => ({ id: crypto.randomUUID(), text, checked: false }));
}

function migrateSnapshotV4(snapshot: z.infer<typeof snapshotV4Schema>) {
  return {
    ...snapshot,
    checklist: migratedChecklist(snapshot.checklist),
    thesisConviction: "" as const,
    changeMindCondition: "",
    readinessScore: undefined,
    readinessIssues: undefined,
  };
}

function migratePlanV4(plan: z.infer<typeof planV4Schema>) {
  return {
    ...plan,
    sessionId: crypto.randomUUID(),
    checklist: migratedChecklist(plan.checklist),
    thesisConviction: "" as const,
    changeMindCondition: "",
    versions: plan.versions.map(migrateSnapshotV4),
    review: migrateReviewV5(plan.review),
  };
}

function migrateV1PlanToV4(plan: z.infer<typeof planV1Schema>): z.infer<typeof planV4Schema> {
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

function migrateReviewV5(review: z.infer<typeof reviewV5Schema>) {
  return {
    ...review,
    executionOrigin: "" as const,
    violatedRuleIds: [],
    readingQuality: 0,
    executionQuality: 0,
  };
}

function migratePlanV5(plan: z.infer<typeof planV5Schema>) {
  return {
    ...plan,
    sessionId: crypto.randomUUID(),
    review: migrateReviewV5(plan.review),
  };
}

function migratePlanV6(plan: z.infer<typeof planV6Schema>) {
  return {
    ...plan,
    sessionId: crypto.randomUUID(),
  };
}

export function initialState(): AppState {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    rules: [],
    setups: [],
    plans: [],
    planTemplates: [],
    journalTrades: [],
    trainingRecords: [],
    setupExamples: [],
    studies: [],
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

  if (versionResult.data.schemaVersion === 7) {
    const legacy = stateV7Schema.safeParse(data);
    if (!legacy.success) {
      const issue = legacy.error.issues[0];
      throw new Error(`Backup v7 inválido em ${issue.path.join(".") || "arquivo"}: ${issue.message}`);
    }
    return {
      ...legacy.data,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      trainingRecords: [],
      setupExamples: [],
      updatedAt: now(),
    };
  }

  if (versionResult.data.schemaVersion === 6) {
    const legacy = stateV6Schema.safeParse(data);
    if (!legacy.success) {
      const issue = legacy.error.issues[0];
      throw new Error(`Backup v6 inválido em ${issue.path.join(".") || "arquivo"}: ${issue.message}`);
    }
    return {
      ...legacy.data,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      plans: legacy.data.plans.map(migratePlanV6),
      journalTrades: [],
      trainingRecords: [],
      setupExamples: [],
      updatedAt: now(),
    };
  }

  if (versionResult.data.schemaVersion === 5) {
    const legacy = stateV5Schema.safeParse(data);
    if (!legacy.success) {
      const issue = legacy.error.issues[0];
      throw new Error(`Backup v5 inválido em ${issue.path.join(".") || "arquivo"}: ${issue.message}`);
    }
    return {
      ...legacy.data,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      plans: legacy.data.plans.map(migratePlanV5),
      journalTrades: [],
      trainingRecords: [],
      setupExamples: [],
      updatedAt: now(),
    };
  }

  if (versionResult.data.schemaVersion === 4) {
    const legacy = stateV4Schema.safeParse(data);
    if (!legacy.success) {
      const issue = legacy.error.issues[0];
      throw new Error(`Backup v4 inválido em ${issue.path.join(".") || "arquivo"}: ${issue.message}`);
    }
    return {
      ...legacy.data,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      plans: legacy.data.plans.map(migratePlanV4),
      planTemplates: [],
      journalTrades: [],
      trainingRecords: [],
      setupExamples: [],
      updatedAt: now(),
    };
  }

  if (versionResult.data.schemaVersion === 3) {
    const legacy = stateV3Schema.safeParse(data);
    if (!legacy.success) {
      const issue = legacy.error.issues[0];
      throw new Error(`Backup v3 inválido em ${issue.path.join(".") || "arquivo"}: ${issue.message}`);
    }
    return {
      ...legacy.data,
      schemaVersion: CURRENT_SCHEMA_VERSION,
      plans: legacy.data.plans.map(migratePlanV4),
      planTemplates: [],
      journalTrades: [],
      trainingRecords: [],
      setupExamples: [],
      studies: [],
      updatedAt: now(),
    };
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
      plans: legacy.data.plans.map(migratePlanV4),
      planTemplates: [],
      journalTrades: [],
      trainingRecords: [],
      setupExamples: [],
      studies: [],
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
      plans: legacy.data.plans.map((plan) => migratePlanV4(migrateV1PlanToV4(plan))),
      planTemplates: [],
      journalTrades: [],
      trainingRecords: [],
      setupExamples: [],
      studies: [],
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

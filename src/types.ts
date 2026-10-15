export type Attachment = {
  id: string;
  name: string;
  dataUrl: string;
  createdAt: string;
};

export type RuleCategory =
  | "Entrada"
  | "Saída"
  | "Risco"
  | "Horário"
  | "Contexto"
  | "Comportamento"
  | "Outro";

export type TradeRule = {
  id: string;
  title: string;
  category: RuleCategory;
  description: string;
  rationale: string;
  active: boolean;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
};

export type Scenario = {
  id: string;
  label: "A" | "B" | "C";
  title: string;
  trigger: string;
  confirmation: string;
  action: string;
  invalidation: string;
  stop: string;
  targets: string;
  avoid: string;
};

export type TradeSetup = {
  id: string;
  title: string;
  description: string;
  marketContext: string;
  entryCriteria: string;
  confirmation: string;
  invalidation: string;
  stopModel: string;
  targetModel: string;
  avoid: string;
  behaviorNotes: string;
  active: boolean;
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
};

export type ChecklistItem = {
  id: string;
  text: string;
  checked: boolean;
};

export type ThesisConviction = "" | "Baixa" | "Média" | "Alta";

export type PlanReview = {
  happened: string;
  observedScenario: "A" | "B" | "C" | "Nenhum" | "Mistura" | "";
  followedPlan: "Sim" | "Parcialmente" | "Não" | "Não operei" | "";
  executionSummary: string;
  deviations: string;
  lessons: string;
  result: string;
  attachments: Attachment[];
  reviewedAt?: string;
};

export type PlanSnapshot = {
  id: string;
  version: number;
  frozenAt: string;
  asset: string;
  tradingDate: string;
  bias: "Alta" | "Baixa" | "Neutro";
  setupId?: string;
  marketContext: string;
  keyLevels: string;
  macroEvents: string;
  evidenceAgainstThesis: string;
  maxRisk: string;
  maxTrades: number;
  noTradeConditions: string;
  checklist: ChecklistItem[];
  scenarios: Scenario[];
  behaviorPlan: string;
  thesisConviction: ThesisConviction;
  changeMindCondition: string;
  readinessScore?: number;
  readinessIssues?: string[];
  attachments: Attachment[];
};

export type TradePlan = {
  id: string;
  planDate: string;
  tradingDate: string;
  asset: string;
  bias: "Alta" | "Baixa" | "Neutro";
  setupId?: string;
  marketContext: string;
  keyLevels: string;
  macroEvents: string;
  evidenceAgainstThesis: string;
  maxRisk: string;
  maxTrades: number;
  noTradeConditions: string;
  checklist: ChecklistItem[];
  scenarios: Scenario[];
  behaviorPlan: string;
  thesisConviction: ThesisConviction;
  changeMindCondition: string;
  attachments: Attachment[];
  planStatus: "draft" | "frozen";
  versions: PlanSnapshot[];
  review: PlanReview;
  createdAt: string;
  updatedAt: string;
};


export type PlanTemplate = {
  id: string;
  title: string;
  asset: string;
  setupId?: string;
  bias: "Alta" | "Baixa" | "Neutro";
  thesisConviction: ThesisConviction;
  marketContext: string;
  keyLevels: string;
  macroEvents: string;
  evidenceAgainstThesis: string;
  changeMindCondition: string;
  maxRisk: string;
  maxTrades: number;
  noTradeConditions: string;
  checklist: ChecklistItem[];
  scenarios: Scenario[];
  behaviorPlan: string;
  createdAt: string;
  updatedAt: string;
};


export type TradeStudy = {
  id: string;
  title: string;
  studyDate: string;
  referenceDate: string;
  asset: string;
  timeframe: string;
  bias: "Alta" | "Baixa" | "Neutro";
  setupId?: string;
  objective: string;
  marketContext: string;
  keyLevels: string;
  macroEvents: string;
  evidenceAgainstThesis: string;
  scenarios: Scenario[];
  behaviorPlan: string;
  conclusion: string;
  lessons: string;
  status: "draft" | "completed";
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
};

export type Settings = {
  traderName: string;
  assets: string[];
  defaultMaxRisk: string;
  defaultMaxTrades: number;
  theme: "dark" | "light";
  language: "pt-BR" | "en" | "es";
  attachments: Attachment[];
};

export type AppState = {
  schemaVersion: number;
  rules: TradeRule[];
  setups: TradeSetup[];
  plans: TradePlan[];
  planTemplates: PlanTemplate[];
  studies: TradeStudy[];
  settings: Settings;
  updatedAt: string;
};

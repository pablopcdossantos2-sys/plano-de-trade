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

export type PlanReview = {
  happened: string;
  observedScenario: "A" | "B" | "C" | "Nenhum" | "Mistura" | "";
  followedPlan: "Sim" | "Parcialmente" | "Não" | "Não operei" | "";
  deviations: string;
  lessons: string;
  result: string;
  attachments: Attachment[];
  reviewedAt?: string;
};

export type TradePlan = {
  id: string;
  planDate: string;
  tradingDate: string;
  asset: string;
  bias: "Alta" | "Baixa" | "Neutro";
  marketContext: string;
  keyLevels: string;
  macroEvents: string;
  maxRisk: string;
  maxTrades: number;
  noTradeConditions: string;
  checklist: string[];
  scenarios: Scenario[];
  behaviorPlan: string;
  attachments: Attachment[];
  review: PlanReview;
  createdAt: string;
  updatedAt: string;
};

export type Settings = {
  traderName: string;
  assets: string[];
  defaultMaxRisk: string;
  defaultMaxTrades: number;
  theme: "dark" | "light";
  attachments: Attachment[];
};

export type AppState = {
  schemaVersion: number;
  rules: TradeRule[];
  plans: TradePlan[];
  settings: Settings;
  updatedAt: string;
};

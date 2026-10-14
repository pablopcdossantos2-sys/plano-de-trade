import { useEffect, useMemo, useRef, useState } from "react";
import { prepareImage } from "./images";
import { exportBackup, initialState, loadState, parseBackup, saveState, STORAGE_KEY } from "./storage";
import { localeForLanguage, translateUi, useInterfaceLanguage, type UiLanguage } from "./i18n";
import type {
  AppState,
  Attachment,
  PlanReview,
  PlanSnapshot,
  RuleCategory,
  Scenario,
  TradePlan,
  TradeRule,
  TradeSetup,
} from "./types";

type Tab = "dashboard" | "rules" | "setups" | "plans" | "settings";

const ruleCategories: RuleCategory[] = ["Entrada", "Saída", "Risco", "Horário", "Contexto", "Comportamento", "Outro"];
const defaultChecklist = [
  "Li minhas regras do sistema antes de operar",
  "Mapeei eventos macroeconômicos e horários de risco",
  "Defini onde não devo operar",
  "Defini risco máximo e número máximo de trades",
  "Procurei evidências que contradizem minha tese principal",
];

let activeLocale = "pt-BR";
let activeLanguage: UiLanguage = "pt-BR";

function isoDateLocal(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function tomorrow() {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  return isoDateLocal(date);
}

function emptyScenario(label: "A" | "B" | "C"): Scenario {
  return {
    id: crypto.randomUUID(),
    label,
    title: "",
    trigger: "",
    confirmation: "",
    action: "",
    invalidation: "",
    stop: "",
    targets: "",
    avoid: "",
  };
}

function emptyReview(): PlanReview {
  return {
    happened: "",
    observedScenario: "",
    followedPlan: "",
    executionSummary: "",
    deviations: "",
    lessons: "",
    result: "",
    attachments: [],
  };
}

function newPlan(state: AppState): TradePlan {
  const stamp = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    planDate: isoDateLocal(),
    tradingDate: tomorrow(),
    asset: state.settings.assets[0] ?? "",
    bias: "Neutro",
    setupId: undefined,
    marketContext: "",
    keyLevels: "",
    macroEvents: "",
    evidenceAgainstThesis: "",
    maxRisk: state.settings.defaultMaxRisk,
    maxTrades: state.settings.defaultMaxTrades,
    noTradeConditions: "",
    checklist: [...defaultChecklist],
    scenarios: [emptyScenario("A"), emptyScenario("B"), emptyScenario("C")],
    behaviorPlan: "",
    attachments: [],
    planStatus: "draft",
    versions: [],
    review: emptyReview(),
    createdAt: stamp,
    updatedAt: stamp,
  };
}

function blankSetup(): TradeSetup {
  const stamp = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: "",
    description: "",
    marketContext: "",
    entryCriteria: "",
    confirmation: "",
    invalidation: "",
    stopModel: "",
    targetModel: "",
    avoid: "",
    behaviorNotes: "",
    active: true,
    attachments: [],
    createdAt: stamp,
    updatedAt: stamp,
  };
}

function fmtDate(value: string) {
  if (!value) return "—";
  const [y, m, d] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(activeLocale, { dateStyle: "short" }).format(new Date(y, m - 1, d));
}

function fmtDateTime(value?: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat(activeLocale, { dateStyle: "short", timeStyle: "short" }).format(new Date(value));
}

function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = href;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(href);
}

function snapshotFromPlan(plan: TradePlan, version: number): PlanSnapshot {
  return {
    id: crypto.randomUUID(),
    version,
    frozenAt: new Date().toISOString(),
    asset: plan.asset,
    tradingDate: plan.tradingDate,
    bias: plan.bias,
    setupId: plan.setupId,
    marketContext: plan.marketContext,
    keyLevels: plan.keyLevels,
    macroEvents: plan.macroEvents,
    evidenceAgainstThesis: plan.evidenceAgainstThesis,
    maxRisk: plan.maxRisk,
    maxTrades: plan.maxTrades,
    noTradeConditions: plan.noTradeConditions,
    checklist: structuredClone(plan.checklist),
    scenarios: structuredClone(plan.scenarios),
    behaviorPlan: plan.behaviorPlan,
    attachments: structuredClone(plan.attachments),
  };
}

function currentReference(plan: TradePlan): PlanSnapshot {
  return snapshotFromPlan(plan, Math.max(plan.versions.length, 1));
}

function latestFrozenVersion(plan: TradePlan) {
  return plan.versions.at(-1);
}

function AttachmentField({ value, onChange, title = "Imagens", disabled = false }: { value: Attachment[]; onChange: (next: Attachment[]) => void; title?: string; disabled?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add(files: FileList | null) {
    if (!files?.length || disabled) return;
    setBusy(true);
    setError("");
    try {
      const prepared: Attachment[] = [];
      for (const file of Array.from(files)) prepared.push(await prepareImage(file));
      onChange([...value, ...prepared]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao anexar imagem.");
    } finally {
      setBusy(false);
    }
  }

  return <div className={`attachment-field ${disabled ? "disabled" : ""}`}>
    <div className="field-label-row"><span>{title}</span><small>PNG/JPG/WebP • compactação automática</small></div>
    {!disabled && <label className="image-drop">
      <input type="file" accept="image/*" multiple onChange={(e) => { void add(e.target.files); e.currentTarget.value = ""; }} />
      {busy ? "Preparando imagens…" : "+ Anexar imagens"}
    </label>}
    {error && <div className="error">{error}</div>}
    {!!value.length && <div className="thumb-grid">{value.map((img) => <figure key={img.id}>
      <img src={img.dataUrl} alt={img.name} />
      <figcaption title={img.name}>{img.name}</figcaption>
      {!disabled && <button type="button" className="tiny danger" onClick={() => onChange(value.filter((x) => x.id !== img.id))}>Remover</button>}
    </figure>)}</div>}
  </div>;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function Dashboard({ state, onOpenPlans, onOpenSetups }: { state: AppState; onOpenPlans: () => void; onOpenSetups: () => void }) {
  const upcoming = useMemo(
    () => [...state.plans].filter((p) => p.tradingDate >= isoDateLocal()).sort((a, b) => a.tradingDate.localeCompare(b.tradingDate)).slice(0, 6),
    [state.plans],
  );
  const reviewed = state.plans.filter((p) => !!p.review.reviewedAt).length;
  const followed = state.plans.filter((p) => p.review.followedPlan === "Sim").length;
  const frozen = state.plans.filter((p) => p.planStatus === "frozen").length;

  return <section className="page">
    <div className="hero">
      <div>
        <span className="eyebrow">PREPARAÇÃO ANTES DA EXECUÇÃO</span>
        <h1>Transforme hipóteses em decisões previamente pensadas.</h1>
        <p>Planeje o pregão antes da abertura, confronte sua própria tese, congele a preparação e compare depois o mercado real com aquilo que você havia decidido fazer.</p>
      </div>
      <button className="primary big" onClick={onOpenPlans}>Criar plano para o próximo pregão</button>
    </div>

    <div className="stats">
      <div><strong>{state.rules.filter((r) => r.active).length}</strong><span>regras ativas</span></div>
      <div><strong>{state.setups.filter((s) => s.active).length}</strong><span>setups ativos</span></div>
      <div><strong>{frozen}</strong><span>planos congelados</span></div>
      <div><strong>{reviewed ? Math.round((followed / reviewed) * 100) : 0}%</strong><span>aderência integral</span></div>
    </div>

    <div className="two-cols">
      <div className="panel">
        <div className="panel-title"><div><span className="eyebrow">AGENDA</span><h2>Próximos planos</h2></div></div>
        {upcoming.length ? <div className="list">{upcoming.map((p) => <div className="list-row" key={p.id}>
          <div><strong>{p.asset}</strong><span>{fmtDate(p.tradingDate)} • viés {p.bias.toLowerCase()} • {p.versions.length ? `v${p.versions.length}` : "sem versão congelada"}</span></div>
          <span className={`badge ${p.review.reviewedAt ? "ok" : p.planStatus === "frozen" ? "locked" : ""}`}>{p.review.reviewedAt ? "revisado" : p.planStatus === "frozen" ? "congelado" : "rascunho"}</span>
        </div>)}</div> : <div className="empty">Nenhum plano futuro. Crie o primeiro plano para o próximo pregão.</div>}
      </div>
      <div className="panel">
        <span className="eyebrow">MÉTODO</span><h2>Ciclo recomendado</h2>
        <ol className="cycle">
          <li><b>Setup + contexto</b><span>Use um padrão conhecido sem ignorar as condições particulares do dia.</span></li>
          <li><b>Contraprova</b><span>Procure evidências contra sua tese antes de defendê-la.</span></li>
          <li><b>Congelamento</b><span>Preserve exatamente o que havia sido decidido antes do pregão.</span></li>
          <li><b>Comparação</b><span>Separe mercado real, sua execução e qualidade do plano.</span></li>
        </ol>
        <button className="small" onClick={onOpenSetups}>Abrir biblioteca de setups</button>
      </div>
    </div>
  </section>;
}

function RulesPage({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [editing, setEditing] = useState<TradeRule | null>(null);
  const blank = (): TradeRule => ({ id: crypto.randomUUID(), title: "", category: "Entrada", description: "", rationale: "", active: true, attachments: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  const [draft, setDraft] = useState<TradeRule>(blank());

  function save() {
    if (!draft.title.trim() || !draft.description.trim()) return;
    const item = { ...draft, updatedAt: new Date().toISOString() };
    setState((s) => ({ ...s, rules: editing ? s.rules.map((r) => r.id === item.id ? item : r) : [item, ...s.rules] }));
    setEditing(null);
    setDraft(blank());
  }

  function edit(rule: TradeRule) {
    setEditing(rule);
    setDraft(structuredClone(rule));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return <section className="page">
    <div className="page-heading"><div><span className="eyebrow">SEU PLAYBOOK</span><h1>Regras do sistema de trade</h1><p>Registre aquilo que deve continuar verdadeiro mesmo quando o mercado ou suas emoções mudarem.</p></div></div>
    <div className="panel form-panel"><h2>{editing ? "Editar regra" : "Adicionar regra"}</h2>
      <div className="form-grid">
        <Field label="Nome da regra"><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Ex.: Não aumentar stop após entrar" /></Field>
        <Field label="Categoria"><select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as RuleCategory })}>{ruleCategories.map((x) => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Regra"><textarea rows={4} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Escreva de forma objetiva o que deve ou não deve ser feito." /></Field>
        <Field label="Por que esta regra existe?" hint="Registrar a justificativa ajuda a obedecer a regra quando houver pressão."><textarea rows={4} value={draft.rationale} onChange={(e) => setDraft({ ...draft, rationale: e.target.value })} placeholder="Que problema, erro recorrente ou princípio técnico esta regra protege?" /></Field>
      </div>
      <label className="check"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Regra ativa</label>
      <AttachmentField value={draft.attachments} onChange={(attachments) => setDraft({ ...draft, attachments })} title="Imagens explicativas da regra" />
      <div className="actions"><button className="primary" onClick={save}>{editing ? "Salvar alterações" : "Adicionar regra"}</button>{editing && <button onClick={() => { setEditing(null); setDraft(blank()); }}>Cancelar</button>}</div>
    </div>
    <div className="cards">{state.rules.map((rule) => <article className={`rule-card ${!rule.active ? "muted" : ""}`} key={rule.id}>
      <div className="card-top"><span className="badge">{rule.category}</span><span className={`status-dot ${rule.active ? "on" : ""}`}>{rule.active ? "ativa" : "inativa"}</span></div>
      <h3>{rule.title}</h3><p>{rule.description}</p>
      {rule.rationale && <div className="why"><b>Por quê:</b> {rule.rationale}</div>}
      {!!rule.attachments.length && <div className="mini-images">{rule.attachments.slice(0, 3).map((img) => <img key={img.id} src={img.dataUrl} alt={img.name} />)}</div>}
      <div className="card-actions"><button onClick={() => edit(rule)}>Editar</button><button className="danger" onClick={() => setState((s) => ({ ...s, rules: s.rules.filter((r) => r.id !== rule.id) }))}>Remover</button></div>
    </article>)}</div>
    {!state.rules.length && <div className="empty">Você ainda não cadastrou regras. Comece pelas regras de risco e pelas situações em que não deve operar.</div>}
  </section>;
}

function SetupsPage({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<TradeSetup>(() => blankSetup());

  function reset() {
    setEditingId(null);
    setDraft(blankSetup());
  }

  function save() {
    if (!draft.title.trim() || !draft.entryCriteria.trim()) return;
    const item = { ...draft, updatedAt: new Date().toISOString() };
    setState((s) => ({
      ...s,
      setups: editingId ? s.setups.map((setup) => setup.id === item.id ? item : setup) : [item, ...s.setups],
    }));
    reset();
  }

  function edit(setup: TradeSetup) {
    setEditingId(setup.id);
    setDraft(structuredClone(setup));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return <section className="page">
    <div className="page-heading"><div><span className="eyebrow">PADRÕES REPETÍVEIS</span><h1>Biblioteca de setups</h1><p>Guarde o padrão operacional que você quer reconhecer repetidamente. O setup serve como template; o plano diário adapta esse padrão ao contexto real do pregão.</p></div></div>
    <div className="panel form-panel">
      <h2>{editingId ? "Editar setup" : "Novo setup"}</h2>
      <div className="form-grid two">
        <Field label="Nome do setup"><input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Ex.: Pullback na VWAP após abertura direcional" /></Field>
        <Field label="Descrição curta"><input value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Qual ideia operacional este setup representa?" /></Field>
        <Field label="Contexto em que funciona melhor"><textarea rows={4} value={draft.marketContext} onChange={(e) => setDraft({ ...draft, marketContext: e.target.value })} placeholder="Tendência, volatilidade, localização, horário, correlações…" /></Field>
        <Field label="Critérios de entrada"><textarea rows={4} value={draft.entryCriteria} onChange={(e) => setDraft({ ...draft, entryCriteria: e.target.value })} placeholder="Condições objetivas para considerar a entrada." /></Field>
        <Field label="Confirmações necessárias"><textarea rows={4} value={draft.confirmation} onChange={(e) => setDraft({ ...draft, confirmation: e.target.value })} placeholder="O que precisa acontecer antes da execução?" /></Field>
        <Field label="Invalidação"><textarea rows={4} value={draft.invalidation} onChange={(e) => setDraft({ ...draft, invalidation: e.target.value })} placeholder="Quando o setup deixa de existir?" /></Field>
        <Field label="Modelo de stop / risco"><textarea rows={3} value={draft.stopModel} onChange={(e) => setDraft({ ...draft, stopModel: e.target.value })} placeholder="Onde e por que o stop deve ficar?" /></Field>
        <Field label="Modelo de alvo / gestão"><textarea rows={3} value={draft.targetModel} onChange={(e) => setDraft({ ...draft, targetModel: e.target.value })} placeholder="Parciais, trailing, alvos técnicos…" /></Field>
        <Field label="O que evitar"><textarea rows={3} value={draft.avoid} onChange={(e) => setDraft({ ...draft, avoid: e.target.value })} placeholder="Erros típicos: antecipar, perseguir preço, operar fora do horário…" /></Field>
        <Field label="Cuidados comportamentais"><textarea rows={3} value={draft.behaviorNotes} onChange={(e) => setDraft({ ...draft, behaviorNotes: e.target.value })} placeholder="Como devo agir para executar este setup corretamente?" /></Field>
      </div>
      <label className="check"><input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Setup ativo</label>
      <AttachmentField value={draft.attachments} onChange={(attachments) => setDraft({ ...draft, attachments })} title="Exemplos visuais do setup" />
      <div className="actions"><button className="primary" onClick={save}>{editingId ? "Salvar alterações" : "Adicionar setup"}</button>{editingId && <button onClick={reset}>Cancelar</button>}</div>
    </div>

    <div className="cards setup-cards">{state.setups.map((setup) => <article className={`rule-card ${!setup.active ? "muted" : ""}`} key={setup.id}>
      <div className="card-top"><span className="badge">Setup</span><span className={`status-dot ${setup.active ? "on" : ""}`}>{setup.active ? "ativo" : "inativo"}</span></div>
      <h3>{setup.title}</h3><p>{setup.description || setup.marketContext}</p>
      <div className="why"><b>Entrada:</b> {setup.entryCriteria}</div>
      {setup.invalidation && <div className="why"><b>Invalida quando:</b> {setup.invalidation}</div>}
      {!!setup.attachments.length && <div className="mini-images">{setup.attachments.slice(0, 3).map((img) => <img key={img.id} src={img.dataUrl} alt={img.name} />)}</div>}
      <div className="card-actions"><button onClick={() => edit(setup)}>Editar</button><button className="danger" onClick={() => { if (confirm(translateUi("Remover este setup?", activeLanguage))) setState((s) => ({ ...s, setups: s.setups.filter((x) => x.id !== setup.id) })); }}>Remover</button></div>
    </article>)}</div>
    {!state.setups.length && <div className="empty">Nenhum setup cadastrado. Registre primeiro os padrões que você realmente deseja repetir e reconhecer.</div>}
  </section>;
}

function ScenarioEditor({ scenario, onChange }: { scenario: Scenario; onChange: (next: Scenario) => void }) {
  const patch = (key: keyof Scenario, value: string) => onChange({ ...scenario, [key]: value });
  return <div className="scenario">
    <div className="scenario-label">Cenário {scenario.label}</div>
    <Field label="Nome do cenário"><input value={scenario.title} onChange={(e) => patch("title", e.target.value)} placeholder="Ex.: Rompimento com aceitação acima da máxima" /></Field>
    <div className="form-grid two">
      <Field label="Se isto acontecer…"><textarea rows={3} value={scenario.trigger} onChange={(e) => patch("trigger", e.target.value)} placeholder="Condição objetiva que ativa a hipótese." /></Field>
      <Field label="Quero ver como confirmação…"><textarea rows={3} value={scenario.confirmation} onChange={(e) => patch("confirmation", e.target.value)} placeholder="O que precisa confirmar antes da entrada?" /></Field>
      <Field label="Então farei…"><textarea rows={3} value={scenario.action} onChange={(e) => patch("action", e.target.value)} placeholder="Plano de ação: entrada, espera, direção, técnica." /></Field>
      <Field label="O cenário deixa de valer quando…"><textarea rows={3} value={scenario.invalidation} onChange={(e) => patch("invalidation", e.target.value)} placeholder="Critério que invalida a tese." /></Field>
      <Field label="Stop / risco"><input value={scenario.stop} onChange={(e) => patch("stop", e.target.value)} placeholder="Ex.: abaixo de 128.450; 1R" /></Field>
      <Field label="Alvos / gestão"><input value={scenario.targets} onChange={(e) => patch("targets", e.target.value)} placeholder="Ex.: parcial em 1R e alvo em 2R" /></Field>
    </div>
    <Field label="O que NÃO fazer neste cenário"><textarea rows={2} value={scenario.avoid} onChange={(e) => patch("avoid", e.target.value)} placeholder="Ex.: não antecipar rompimento; não perseguir preço." /></Field>
  </div>;
}

function VersionHistory({ plan }: { plan: TradePlan }) {
  if (!plan.versions.length) return <div className="version-history empty-version">Nenhuma versão foi congelada ainda. Enquanto estiver em rascunho, o planejamento pode ser alterado sem deixar registro histórico.</div>;
  return <div className="version-history">
    {plan.versions.map((version) => <div key={version.id} className="version-chip"><b>v{version.version}</b><span>{fmtDateTime(version.frozenAt)}</span></div>)}
  </div>;
}

function ComparisonPanel({ plan }: { plan: TradePlan }) {
  const frozen = latestFrozenVersion(plan);
  const reference = frozen ?? currentReference(plan);
  const scenarioSummary = reference.scenarios.filter((s) => s.title || s.trigger).map((s) => `${s.label}: ${s.title || s.trigger}`).join(" • ") || "Cenários não definidos";

  return <div className="comparison-wrap">
    <div className="comparison-heading">
      <div><span className="eyebrow">COMPARADOR</span><h3>Planejado × Mercado real × Minha execução</h3></div>
      <span className={`badge ${frozen ? "locked" : "warning"}`}>{frozen ? `Referência congelada v${frozen.version}` : "Sem versão congelada"}</span>
    </div>
    {!frozen && <div className="review-callout warning-callout">Este plano não possui uma fotografia congelada. O comparador usa o rascunho atual apenas como referência e sinaliza que ele não é uma evidência imutável do planejamento pré-pregão.</div>}
    <div className="comparison-grid">
      <article>
        <span className="comparison-number">1</span><h4>Planejado</h4>
        <dl>
          <div><dt>Viés</dt><dd>{reference.bias}</dd></div>
          <div><dt>Cenários</dt><dd>{scenarioSummary}</dd></div>
          <div><dt>Contra a tese</dt><dd>{reference.evidenceAgainstThesis || "Não registrado"}</dd></div>
          <div><dt>Não operar se</dt><dd>{reference.noTradeConditions || "Não registrado"}</dd></div>
          <div><dt>Comportamento</dt><dd>{reference.behaviorPlan || "Não registrado"}</dd></div>
        </dl>
      </article>
      <article>
        <span className="comparison-number">2</span><h4>Mercado real</h4>
        <dl>
          <div><dt>Cenário observado</dt><dd>{plan.review.observedScenario || "Ainda não revisado"}</dd></div>
          <div><dt>O que aconteceu</dt><dd>{plan.review.happened || "Descreva abaixo depois do pregão."}</dd></div>
        </dl>
      </article>
      <article>
        <span className="comparison-number">3</span><h4>Minha execução</h4>
        <dl>
          <div><dt>Segui o plano?</dt><dd>{plan.review.followedPlan || "Ainda não avaliado"}</dd></div>
          <div><dt>O que fiz</dt><dd>{plan.review.executionSummary || "Descreva abaixo sua execução."}</dd></div>
          <div><dt>Desvios</dt><dd>{plan.review.deviations || "Nenhum desvio registrado"}</dd></div>
          <div><dt>Resultado</dt><dd>{plan.review.result || "Não registrado"}</dd></div>
        </dl>
      </article>
    </div>
  </div>;
}

function PlanEditor({ initial, assets, setups, onPersist, onClose }: { initial: TradePlan; assets: string[]; setups: TradeSetup[]; onPersist: (p: TradePlan) => void; onClose: () => void }) {
  const [draft, setDraft] = useState<TradePlan>(() => structuredClone(initial));
  const [section, setSection] = useState<"plan" | "review">("plan");
  const [notice, setNotice] = useState("");
  const isFrozen = draft.planStatus === "frozen";

  function patchScenario(id: string, next: Scenario) {
    setDraft((d) => ({ ...d, scenarios: d.scenarios.map((s) => s.id === id ? next : s) }));
  }

  function persist(next = draft, message = "Plano salvo.") {
    if (!next.asset.trim() || !next.tradingDate) return;
    const saved = { ...next, updatedAt: new Date().toISOString() };
    setDraft(saved);
    onPersist(saved);
    setNotice(message);
  }

  function freeze() {
    if (!draft.asset.trim() || !draft.tradingDate) return;
    const version = draft.versions.length + 1;
    const snapshot = snapshotFromPlan(draft, version);
    const next: TradePlan = {
      ...draft,
      planStatus: "frozen",
      versions: [...draft.versions, snapshot],
      updatedAt: new Date().toISOString(),
    };
    setDraft(next);
    onPersist(next);
    setNotice(`Versão ${version} congelada. O planejamento agora está protegido contra alterações acidentais.`);
  }

  function createNewVersion() {
    const next = { ...draft, planStatus: "draft" as const, updatedAt: new Date().toISOString() };
    setDraft(next);
    onPersist(next);
    setSection("plan");
    setNotice(`Nova versão em rascunho. A v${draft.versions.length} permanece preservada.`);
  }

  function applySetup() {
    const setup = setups.find((item) => item.id === draft.setupId);
    if (!setup) return;
    const scenarioA = draft.scenarios.find((s) => s.label === "A");
    setDraft({
      ...draft,
      marketContext: setup.marketContext || draft.marketContext,
      behaviorPlan: setup.behaviorNotes || draft.behaviorPlan,
      scenarios: draft.scenarios.map((scenario) => scenario.label === "A" ? {
        ...scenario,
        title: setup.title,
        trigger: setup.entryCriteria,
        confirmation: setup.confirmation,
        invalidation: setup.invalidation,
        stop: setup.stopModel,
        targets: setup.targetModel,
        avoid: setup.avoid,
      } : scenario),
    });
    if (!scenarioA) setNotice("O setup foi selecionado, mas o plano não possui cenário A para receber o template.");
    else setNotice("Setup aplicado ao cenário A. Adapte os campos ao contexto específico deste pregão.");
  }

  return <div className="panel plan-editor">
    <div className="editor-head">
      <div><span className="eyebrow">{draft.versions.length ? `PLANO COM ${draft.versions.length} VERSÃO(ÕES) PRESERVADA(S)` : "PLANO EM CONSTRUÇÃO"}</span><h2>{draft.asset || "Ativo"} • {fmtDate(draft.tradingDate)}</h2></div>
      <div className="segmented"><button className={section === "plan" ? "active" : ""} onClick={() => setSection("plan")}>Planejamento</button><button className={section === "review" ? "active" : ""} onClick={() => setSection("review")}>Comparar e revisar</button></div>
    </div>

    <div className={`freeze-banner ${isFrozen ? "locked" : "draft"}`}>
      <div><b>{isFrozen ? "Planejamento congelado" : "Rascunho editável"}</b><span>{isFrozen ? `A v${draft.versions.length} foi preservada em ${fmtDateTime(latestFrozenVersion(draft)?.frozenAt)}.` : "Edite livremente. Quando terminar a preparação, congele uma versão antes do pregão."}</span></div>
      {isFrozen ? <button onClick={createNewVersion}>Criar nova versão</button> : <button className="primary" onClick={freeze}>Congelar versão {draft.versions.length + 1}</button>}
    </div>
    <VersionHistory plan={draft} />
    {notice && <div className="notice">{notice}</div>}

    {section === "plan" ? <fieldset className="freeze-fieldset" disabled={isFrozen}>
      <div className="form-grid three">
        <Field label="Ativo"><input list="assets" value={draft.asset} onChange={(e) => setDraft({ ...draft, asset: e.target.value.toUpperCase() })} /><datalist id="assets">{assets.map((a) => <option key={a} value={a} />)}</datalist></Field>
        <Field label="Data do pregão"><input type="date" value={draft.tradingDate} onChange={(e) => setDraft({ ...draft, tradingDate: e.target.value })} /></Field>
        <Field label="Viés inicial"><select value={draft.bias} onChange={(e) => setDraft({ ...draft, bias: e.target.value as TradePlan["bias"] })}><option>Alta</option><option>Baixa</option><option>Neutro</option></select></Field>
      </div>

      <div className="setup-apply">
        <Field label="Setup de referência (opcional)" hint="O setup é um template. Depois de aplicá-lo, adapte o plano ao contexto do pregão.">
          <select value={draft.setupId ?? ""} onChange={(e) => setDraft({ ...draft, setupId: e.target.value || undefined })}>
            <option value="">Nenhum setup</option>
            {setups.filter((s) => s.active).map((setup) => <option key={setup.id} value={setup.id}>{setup.title}</option>)}
          </select>
        </Field>
        <button type="button" onClick={applySetup} disabled={!draft.setupId}>Aplicar setup ao cenário A</button>
      </div>

      <div className="form-grid two">
        <Field label="Contexto de mercado"><textarea rows={6} value={draft.marketContext} onChange={(e) => setDraft({ ...draft, marketContext: e.target.value })} placeholder="Tendência, localização do preço, volatilidade, fluxo, correlações, fechamento anterior…" /></Field>
        <Field label="Níveis importantes"><textarea rows={6} value={draft.keyLevels} onChange={(e) => setDraft({ ...draft, keyLevels: e.target.value })} placeholder="Máxima/mínima anterior, VWAP, gaps, suportes, resistências, regiões de liquidez…" /></Field>
        <Field label="Eventos e horários de atenção"><textarea rows={4} value={draft.macroEvents} onChange={(e) => setDraft({ ...draft, macroEvents: e.target.value })} placeholder="Ex.: Copom, payroll, abertura NY, leilões, vencimentos…" /></Field>
        <Field label="Condições para NÃO operar"><textarea rows={4} value={draft.noTradeConditions} onChange={(e) => setDraft({ ...draft, noTradeConditions: e.target.value })} placeholder="Ex.: spread anormal, contexto confuso, perda de limite diário…" /></Field>
      </div>

      <div className="counter-thesis">
        <Field label="Evidências contra minha tese / por que posso estar errado?" hint="Procure deliberadamente dados que contradigam seu viés. O objetivo é reduzir viés de confirmação.">
          <textarea rows={5} value={draft.evidenceAgainstThesis} onChange={(e) => setDraft({ ...draft, evidenceAgainstThesis: e.target.value })} placeholder="Ex.: fluxo vendedor apesar do viés de alta; dólar rompendo resistência; preço rejeitando a região que sustentava minha hipótese…" />
        </Field>
      </div>

      <div className="form-grid two">
        <Field label="Risco máximo do dia"><input value={draft.maxRisk} onChange={(e) => setDraft({ ...draft, maxRisk: e.target.value })} placeholder="Ex.: 2R ou R$ 600" /></Field>
        <Field label="Máximo de operações"><input type="number" min={1} value={draft.maxTrades} onChange={(e) => setDraft({ ...draft, maxTrades: Math.max(1, Number(e.target.value) || 1) })} /></Field>
      </div>

      <div className="checklist-box"><h3>Checklist pré-mercado</h3>{draft.checklist.map((item, i) => <div className="editable-check" key={i}><span>{i + 1}</span><input value={item} onChange={(e) => setDraft({ ...draft, checklist: draft.checklist.map((x, j) => j === i ? e.target.value : x) })} /><button className="tiny danger" type="button" onClick={() => setDraft({ ...draft, checklist: draft.checklist.filter((_, j) => j !== i) })}>×</button></div>)}<button className="small" type="button" onClick={() => setDraft({ ...draft, checklist: [...draft.checklist, ""] })}>+ Item</button></div>

      <div className="scenario-grid">{draft.scenarios.map((scenario) => <ScenarioEditor key={scenario.id} scenario={scenario} onChange={(next) => patchScenario(scenario.id, next)} />)}</div>

      <Field label="Plano comportamental: se eu sentir/começar a fazer X, então farei Y"><textarea rows={5} value={draft.behaviorPlan} onChange={(e) => setDraft({ ...draft, behaviorPlan: e.target.value })} placeholder="Ex.: Se eu perceber vontade de recuperar prejuízo imediatamente, não enviarei nova ordem; vou me afastar da tela por 5 minutos e reler o limite diário." /></Field>
      <AttachmentField disabled={isFrozen} value={draft.attachments} onChange={(attachments) => setDraft({ ...draft, attachments })} title="Gráficos e imagens do planejamento" />
    </fieldset> : <>
      <ComparisonPanel plan={draft} />
      <div className="review-callout">Preencha esta parte <b>depois do pregão</b>. O planejamento congelado acima permanece intacto para permitir uma comparação honesta.</div>
      <div className="form-grid two">
        <Field label="O que o mercado efetivamente fez?"><textarea rows={7} value={draft.review.happened} onChange={(e) => setDraft({ ...draft, review: { ...draft.review, happened: e.target.value } })} placeholder="Descreva a sequência do mercado, mudanças de contexto e os pontos que mais importaram." /></Field>
        <Field label="O que EU efetivamente fiz?"><textarea rows={7} value={draft.review.executionSummary} onChange={(e) => setDraft({ ...draft, review: { ...draft.review, executionSummary: e.target.value } })} placeholder="Entradas, saídas, esperas, cancelamentos e decisões que você realmente tomou." /></Field>
        <Field label="Qual cenário predominou?"><select value={draft.review.observedScenario} onChange={(e) => setDraft({ ...draft, review: { ...draft.review, observedScenario: e.target.value as PlanReview["observedScenario"] } })}><option value="">Selecione</option><option>A</option><option>B</option><option>C</option><option>Nenhum</option><option>Mistura</option></select></Field>
        <Field label="Você seguiu o plano?"><select value={draft.review.followedPlan} onChange={(e) => setDraft({ ...draft, review: { ...draft.review, followedPlan: e.target.value as PlanReview["followedPlan"] } })}><option value="">Selecione</option><option>Sim</option><option>Parcialmente</option><option>Não</option><option>Não operei</option></select></Field>
        <Field label="Desvios entre plano e execução"><textarea rows={5} value={draft.review.deviations} onChange={(e) => setDraft({ ...draft, review: { ...draft.review, deviations: e.target.value } })} placeholder="O que você fez diferente do planejado? Por quê?" /></Field>
        <Field label="Resultado / observação de resultado"><input value={draft.review.result} onChange={(e) => setDraft({ ...draft, review: { ...draft.review, result: e.target.value } })} placeholder="Ex.: +1,4R; -R$ 250; não operei" /></Field>
        <Field label="Principal aprendizado"><textarea rows={5} value={draft.review.lessons} onChange={(e) => setDraft({ ...draft, review: { ...draft.review, lessons: e.target.value } })} placeholder="O que merece virar regra, ajuste de setup, checklist ou hipótese futura?" /></Field>
      </div>
      <AttachmentField value={draft.review.attachments} onChange={(attachments) => setDraft({ ...draft, review: { ...draft.review, attachments } })} title="Gráficos e imagens do que aconteceu" />
      <label className="check"><input type="checkbox" checked={!!draft.review.reviewedAt} onChange={(e) => setDraft({ ...draft, review: { ...draft.review, reviewedAt: e.target.checked ? new Date().toISOString() : undefined } })} /> Marcar revisão como concluída</label>
    </>}

    <div className="actions sticky-actions">
      <button className="primary" onClick={() => persist(draft, section === "review" ? "Revisão salva." : "Rascunho salvo.")}>Salvar</button>
      <button onClick={() => { persist(draft, "Plano salvo."); onClose(); }}>Salvar e fechar</button>
      <button onClick={onClose}>Fechar sem salvar mudanças atuais</button>
    </div>
  </div>;
}

function PlansPage({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [editing, setEditing] = useState<TradePlan | null>(null);
  const [filter, setFilter] = useState("");
  const plans = useMemo(
    () => [...state.plans].filter((p) => !filter || p.asset.toLowerCase().includes(filter.toLowerCase()) || p.tradingDate.includes(filter)).sort((a, b) => b.tradingDate.localeCompare(a.tradingDate)),
    [state.plans, filter],
  );

  function persist(plan: TradePlan) {
    setState((s) => ({ ...s, plans: s.plans.some((x) => x.id === plan.id) ? s.plans.map((x) => x.id === plan.id ? plan : x) : [plan, ...s.plans] }));
    setEditing(plan);
  }

  if (editing) return <section className="page"><PlanEditor initial={editing} assets={state.settings.assets} setups={state.setups} onClose={() => setEditing(null)} onPersist={persist} /></section>;

  return <section className="page">
    <div className="page-heading"><div><span className="eyebrow">ANTES E DEPOIS DO MERCADO</span><h1>Planos de trade</h1><p>Crie hipóteses, procure contraprovas, congele a preparação e depois compare aquilo que você planejou com o mercado real e sua execução.</p></div><button className="primary" onClick={() => setEditing(newPlan(state))}>+ Novo plano</button></div>
    <div className="toolbar"><input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filtrar por ativo ou data…" /><span>{plans.length} plano(s)</span></div>
    <div className="plan-list">{plans.map((p) => <article className="plan-card" key={p.id}>
      <div className="plan-date"><strong>{fmtDate(p.tradingDate)}</strong><span>{p.asset}</span></div>
      <div className="plan-main">
        <div className="card-top"><div className="badges"><span className={`badge bias-${p.bias.toLowerCase()}`}>Viés {p.bias}</span><span className={`badge ${p.planStatus === "frozen" ? "locked" : "warning"}`}>{p.planStatus === "frozen" ? `Congelado v${p.versions.length}` : p.versions.length ? `Rascunho para v${p.versions.length + 1}` : "Rascunho sem versão"}</span></div>{p.review.reviewedAt ? <span className="badge ok">Revisado</span> : <span className="badge">Aguardando revisão</span>}</div>
        <h3>{p.scenarios.find((s) => s.label === "A")?.title || "Plano sem título de cenário A"}</h3>
        <p>{p.marketContext || "Contexto ainda não descrito."}</p>
        {p.evidenceAgainstThesis && <div className="counter-mini"><b>Contra a tese:</b> {p.evidenceAgainstThesis}</div>}
        <div className="scenario-pills">{p.scenarios.map((s) => <span key={s.id}>{s.label}: {s.title || "não definido"}</span>)}</div>
      </div>
      <div className="vertical-actions"><button onClick={() => setEditing(structuredClone(p))}>Abrir / editar</button><button onClick={() => downloadText(`plano-${p.asset}-${p.tradingDate}.txt`, buildPlanText(p))}>Exportar texto</button><button className="danger" onClick={() => { if (confirm(translateUi("Remover este plano?", activeLanguage))) setState((s) => ({ ...s, plans: s.plans.filter((x) => x.id !== p.id) })); }}>Remover</button></div>
    </article>)}</div>
    {!plans.length && <div className="empty">Nenhum plano encontrado. Crie um plano para o próximo pregão.</div>}
  </section>;
}

function buildPlanText(p: TradePlan) {
  const reference = latestFrozenVersion(p);
  const base = reference ?? currentReference(p);

  const labels = activeLanguage === "en" ? {
    frozen: "FROZEN VERSION",
    draft: "CURRENT DRAFT — NO FROZEN VERSION",
    title: "TRADE PLAN",
    bias: "Bias",
    maxRisk: "Maximum risk",
    maxTrades: "Maximum trades",
    context: "CONTEXT",
    levels: "LEVELS",
    events: "EVENTS",
    counter: "EVIDENCE AGAINST THE THESIS",
    noTrade: "DO NOT TRADE IF",
    scenario: "SCENARIO",
    if: "If",
    confirmation: "Confirmation",
    then: "Then",
    invalidation: "Invalidation",
    stop: "Stop/risk",
    targets: "Targets",
    avoid: "Avoid",
    behavior: "BEHAVIOR PLAN",
    market: "ACTUAL MARKET",
    execution: "MY EXECUTION",
    observed: "Observed scenario",
    followed: "Followed the plan",
    deviations: "Deviations",
    result: "Result",
    lessons: "Lesson",
  } : activeLanguage === "es" ? {
    frozen: "VERSIÓN CONGELADA",
    draft: "BORRADOR ACTUAL — SIN VERSIÓN CONGELADA",
    title: "PLAN DE TRADING",
    bias: "Sesgo",
    maxRisk: "Riesgo máximo",
    maxTrades: "Máximo de operaciones",
    context: "CONTEXTO",
    levels: "NIVELES",
    events: "EVENTOS",
    counter: "EVIDENCIAS CONTRA LA TESIS",
    noTrade: "NO OPERAR SI",
    scenario: "ESCENARIO",
    if: "Si",
    confirmation: "Confirmación",
    then: "Entonces",
    invalidation: "Invalidación",
    stop: "Stop/riesgo",
    targets: "Objetivos",
    avoid: "Evitar",
    behavior: "PLAN CONDUCTUAL",
    market: "MERCADO REAL",
    execution: "MI EJECUCIÓN",
    observed: "Escenario observado",
    followed: "Seguí el plan",
    deviations: "Desviaciones",
    result: "Resultado",
    lessons: "Aprendizaje",
  } : {
    frozen: "VERSÃO CONGELADA",
    draft: "RASCUNHO ATUAL — SEM VERSÃO CONGELADA",
    title: "PLANO DE TRADE",
    bias: "Viés",
    maxRisk: "Risco máximo",
    maxTrades: "Máximo de operações",
    context: "CONTEXTO",
    levels: "NÍVEIS",
    events: "EVENTOS",
    counter: "EVIDÊNCIAS CONTRA A TESE",
    noTrade: "NÃO OPERAR SE",
    scenario: "CENÁRIO",
    if: "Se",
    confirmation: "Confirmação",
    then: "Então",
    invalidation: "Invalidação",
    stop: "Stop/risco",
    targets: "Alvos",
    avoid: "Evitar",
    behavior: "PLANO COMPORTAMENTAL",
    market: "MERCADO REAL",
    execution: "MINHA EXECUÇÃO",
    observed: "Cenário observado",
    followed: "Seguiu o plano",
    deviations: "Desvios",
    result: "Resultado",
    lessons: "Aprendizado",
  };

  const source = reference ? `${labels.frozen} v${reference.version} — ${fmtDateTime(reference.frozenAt)}` : labels.draft;
  const scenarios = base.scenarios.map((s) => `${labels.scenario} ${s.label} — ${s.title}\n${labels.if}: ${s.trigger}\n${labels.confirmation}: ${s.confirmation}\n${labels.then}: ${s.action}\n${labels.invalidation}: ${s.invalidation}\n${labels.stop}: ${s.stop}\n${labels.targets}: ${s.targets}\n${labels.avoid}: ${s.avoid}`).join("\n\n");
  const localizedBias = translateUi(base.bias, activeLanguage);
  const localizedObserved = translateUi(p.review.observedScenario, activeLanguage);
  const localizedFollowed = translateUi(p.review.followedPlan, activeLanguage);

  return `${labels.title} — ${base.asset} — ${fmtDate(base.tradingDate)}\n${source}\n\n${labels.bias}: ${localizedBias}\n${labels.maxRisk}: ${base.maxRisk}\n${labels.maxTrades}: ${base.maxTrades}\n\n${labels.context}\n${base.marketContext}\n\n${labels.levels}\n${base.keyLevels}\n\n${labels.events}\n${base.macroEvents}\n\n${labels.counter}\n${base.evidenceAgainstThesis}\n\n${labels.noTrade}\n${base.noTradeConditions}\n\n${scenarios}\n\n${labels.behavior}\n${base.behaviorPlan}\n\n${labels.market}\n${p.review.happened}\n\n${labels.execution}\n${p.review.executionSummary}\n\n${labels.observed}: ${localizedObserved}\n${labels.followed}: ${localizedFollowed}\n${labels.deviations}: ${p.review.deviations}\n${labels.result}: ${p.review.result}\n${labels.lessons}: ${p.review.lessons}\n`;
}

function SettingsPage({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [assetsText, setAssetsText] = useState(state.settings.assets.join(", "));
  const [message, setMessage] = useState("");

  async function importFile(file: File | undefined) {
    if (!file) return;
    try {
      const next = parseBackup(await file.text());
      setState(next);
      setAssetsText(next.settings.assets.join(", "));
      setMessage("Backup importado com sucesso. Backups anteriores são migrados automaticamente para o schema atual.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Falha ao importar backup.");
    }
  }

  const settings = state.settings;
  const patch = (next: Partial<typeof settings>) => setState((s) => ({ ...s, settings: { ...s.settings, ...next } }));

  return <section className="page">
    <div className="page-heading"><div><span className="eyebrow">PREFERÊNCIAS E DADOS</span><h1>Configurações</h1><p>Os dados ficam neste navegador. Use backups JSON para transportar ou restaurar regras, setups, planos, versões congeladas, revisões e imagens.</p></div></div>
    <div className="two-cols align-start">
      <div className="panel"><h2>Padrões de planejamento</h2>
        <Field label="Nome do trader"><input value={settings.traderName} onChange={(e) => patch({ traderName: e.target.value })} placeholder="Opcional" /></Field>
        <Field label="Ativos disponíveis" hint="Separe os ativos por vírgula."><textarea rows={4} value={assetsText} onChange={(e) => setAssetsText(e.target.value)} onBlur={() => patch({ assets: assetsText.split(",").map((x) => x.trim().toUpperCase()).filter(Boolean) })} /></Field>
        <div className="form-grid two"><Field label="Risco máximo padrão"><input value={settings.defaultMaxRisk} onChange={(e) => patch({ defaultMaxRisk: e.target.value })} placeholder="Ex.: 2R" /></Field><Field label="Máx. de trades padrão"><input type="number" min={1} value={settings.defaultMaxTrades} onChange={(e) => patch({ defaultMaxTrades: Math.max(1, Number(e.target.value) || 1) })} /></Field></div>
        <Field label="Tema"><select value={settings.theme} onChange={(e) => patch({ theme: e.target.value as "dark" | "light" })}><option value="dark">Escuro</option><option value="light">Claro</option></select></Field>
        <Field label="Idioma da interface"><select value={settings.language} onChange={(e) => patch({ language: e.target.value as "pt-BR" | "en" | "es" })}><option value="pt-BR">Português (Brasil)</option><option value="en">English</option><option value="es">Español</option></select></Field>
        <AttachmentField value={settings.attachments} onChange={(attachments) => patch({ attachments })} title="Imagens de referência geral" />
      </div>
      <div className="panel"><h2>Backup e recuperação</h2><p className="muted-text">O JSON é o formato de recuperação completa. O schema v3 inclui biblioteca de setups, histórico de versões congeladas e preferência de idioma.</p>
        <div className="stack-actions"><button className="primary" onClick={() => exportBackup(state)}>Exportar backup JSON</button><button onClick={() => fileRef.current?.click()}>Importar backup JSON</button><input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => void importFile(e.target.files?.[0])} /></div>
        {message && <div className="notice">{message}</div>}
        <div className="danger-zone"><h3>Zona de risco</h3><p>Apaga todos os dados deste navegador. Exporte um backup antes, se necessário.</p><button className="danger" onClick={() => { if (confirm(translateUi("Apagar todos os dados locais? Esta ação não pode ser desfeita.", activeLanguage))) { localStorage.removeItem(STORAGE_KEY); const fresh = initialState(); setState(fresh); setAssetsText(fresh.settings.assets.join(", ")); } }}>Apagar todos os dados</button></div>
      </div>
    </div>
  </section>;
}

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [tab, setTab] = useState<Tab>("dashboard");
  const [saveError, setSaveError] = useState("");

  activeLanguage = state.settings.language;
  activeLocale = localeForLanguage(activeLanguage);
  useInterfaceLanguage(activeLanguage);

  useEffect(() => {
    document.documentElement.dataset.theme = state.settings.theme;
    try {
      saveState(state);
      setSaveError("");
    } catch {
      setSaveError("O navegador não conseguiu salvar os dados. Exporte um backup e reduza a quantidade de imagens.");
    }
  }, [state]);

  const nav: Array<[Tab, string, string]> = [
    ["dashboard", "Visão geral", "⌂"],
    ["rules", "Sistema de trade", "◆"],
    ["setups", "Biblioteca de setups", "▦"],
    ["plans", "Planos de trade", "▤"],
    ["settings", "Configurações", "⚙"],
  ];

  return <div className="app-shell">
    <aside>
      <div className="brand"><div className="brand-mark">PT</div><div><strong>Plano de Trade</strong><span>preparar • congelar • executar • revisar</span></div></div>
      <nav>{nav.map(([id, label, icon]) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><span>{icon}</span>{label}</button>)}</nav>
      <div className="sidebar-foot"><span>Dados locais</span><b>schema v{state.schemaVersion}</b></div>
    </aside>
    <main>
      <header><div><span className="mobile-title">Plano de Trade</span></div><div className="save-state"><span className={saveError ? "bad" : "good"}></span>{saveError || "Salvamento local automático"}</div></header>
      {tab === "dashboard" && <Dashboard state={state} onOpenPlans={() => setTab("plans")} onOpenSetups={() => setTab("setups")} />}
      {tab === "rules" && <RulesPage state={state} setState={setState} />}
      {tab === "setups" && <SetupsPage state={state} setState={setState} />}
      {tab === "plans" && <PlansPage state={state} setState={setState} />}
      {tab === "settings" && <SettingsPage state={state} setState={setState} />}
    </main>
  </div>;
}

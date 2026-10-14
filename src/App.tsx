import { useEffect, useMemo, useRef, useState } from "react";
import { prepareImage } from "./images";
import { exportBackup, initialState, loadState, parseBackup, saveState, STORAGE_KEY } from "./storage";
import type { AppState, Attachment, PlanReview, RuleCategory, Scenario, TradePlan, TradeRule } from "./types";

type Tab = "dashboard" | "rules" | "plans" | "settings";

const ruleCategories: RuleCategory[] = ["Entrada", "Saída", "Risco", "Horário", "Contexto", "Comportamento", "Outro"];
const defaultChecklist = [
  "Li minhas regras do sistema antes de operar",
  "Mapeei eventos macroeconômicos e horários de risco",
  "Defini onde não devo operar",
  "Defini risco máximo e número máximo de trades",
];

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
    id: crypto.randomUUID(), label, title: "", trigger: "", confirmation: "", action: "",
    invalidation: "", stop: "", targets: "", avoid: "",
  };
}

function emptyReview(): PlanReview {
  return { happened: "", observedScenario: "", followedPlan: "", deviations: "", lessons: "", result: "", attachments: [] };
}

function newPlan(state: AppState): TradePlan {
  return {
    id: crypto.randomUUID(),
    planDate: isoDateLocal(),
    tradingDate: tomorrow(),
    asset: state.settings.assets[0] ?? "",
    bias: "Neutro",
    marketContext: "",
    keyLevels: "",
    macroEvents: "",
    maxRisk: state.settings.defaultMaxRisk,
    maxTrades: state.settings.defaultMaxTrades,
    noTradeConditions: "",
    checklist: [...defaultChecklist],
    scenarios: [emptyScenario("A"), emptyScenario("B"), emptyScenario("C")],
    behaviorPlan: "",
    attachments: [],
    review: emptyReview(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function fmtDate(value: string) {
  if (!value) return "—";
  const [y, m, d] = value.split("-");
  return `${d}/${m}/${y}`;
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

function AttachmentField({ value, onChange, title = "Imagens" }: { value: Attachment[]; onChange: (next: Attachment[]) => void; title?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function add(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true); setError("");
    try {
      const prepared: Attachment[] = [];
      for (const file of Array.from(files)) prepared.push(await prepareImage(file));
      onChange([...value, ...prepared]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao anexar imagem.");
    } finally { setBusy(false); }
  }
  return <div className="attachment-field">
    <div className="field-label-row"><span>{title}</span><small>PNG/JPG/WebP • compactação automática</small></div>
    <label className="image-drop">
      <input type="file" accept="image/*" multiple onChange={(e) => { void add(e.target.files); e.currentTarget.value = ""; }} />
      {busy ? "Preparando imagens…" : "+ Anexar imagens"}
    </label>
    {error && <div className="error">{error}</div>}
    {!!value.length && <div className="thumb-grid">{value.map((img) => <figure key={img.id}>
      <img src={img.dataUrl} alt={img.name} />
      <figcaption title={img.name}>{img.name}</figcaption>
      <button type="button" className="tiny danger" onClick={() => onChange(value.filter((x) => x.id !== img.id))}>Remover</button>
    </figure>)}</div>}
  </div>;
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return <label className="field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}

function Dashboard({ state, onOpenPlans }: { state: AppState; onOpenPlans: () => void }) {
  const upcoming = useMemo(() => [...state.plans].filter(p => p.tradingDate >= isoDateLocal()).sort((a,b) => a.tradingDate.localeCompare(b.tradingDate)).slice(0, 6), [state.plans]);
  const reviewed = state.plans.filter(p => !!p.review.reviewedAt).length;
  const followed = state.plans.filter(p => p.review.followedPlan === "Sim").length;
  return <section className="page">
    <div className="hero">
      <div><span className="eyebrow">PREPARAÇÃO ANTES DA EXECUÇÃO</span><h1>Transforme hipóteses em decisões previamente pensadas.</h1>
      <p>Planeje o pregão antes da abertura, descreva o que invalidaria cada cenário e compare depois o mercado real com aquilo que você havia previsto.</p></div>
      <button className="primary big" onClick={onOpenPlans}>Criar plano para o próximo pregão</button>
    </div>
    <div className="stats">
      <div><strong>{state.rules.filter(r => r.active).length}</strong><span>regras ativas</span></div>
      <div><strong>{state.plans.length}</strong><span>planos criados</span></div>
      <div><strong>{reviewed}</strong><span>planos revisados</span></div>
      <div><strong>{reviewed ? Math.round((followed / reviewed) * 100) : 0}%</strong><span>aderência integral</span></div>
    </div>
    <div className="two-cols">
      <div className="panel"><div className="panel-title"><div><span className="eyebrow">AGENDA</span><h2>Próximos planos</h2></div></div>
        {upcoming.length ? <div className="list">{upcoming.map(p => <div className="list-row" key={p.id}><div><strong>{p.asset}</strong><span>{fmtDate(p.tradingDate)} • viés {p.bias.toLowerCase()}</span></div><span className={`badge ${p.review.reviewedAt ? "ok" : ""}`}>{p.review.reviewedAt ? "revisado" : "planejado"}</span></div>)}</div> : <div className="empty">Nenhum plano futuro. Crie o primeiro plano para o próximo pregão.</div>}
      </div>
      <div className="panel"><span className="eyebrow">MÉTODO</span><h2>Ciclo recomendado</h2>
        <ol className="cycle"><li><b>Contexto</b><span>Descreva onde o preço está e o que importa amanhã.</span></li><li><b>Cenários A/B/C</b><span>Defina gatilho, confirmação, ação e invalidação.</span></li><li><b>Comportamento</b><span>Antecipe como você agirá sob pressão.</span></li><li><b>Revisão</b><span>Compare plano, mercado real e sua execução.</span></li></ol>
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
    setState(s => ({ ...s, rules: editing ? s.rules.map(r => r.id === item.id ? item : r) : [item, ...s.rules] }));
    setEditing(null); setDraft(blank());
  }
  function edit(rule: TradeRule) { setEditing(rule); setDraft(structuredClone(rule)); window.scrollTo({ top: 0, behavior: "smooth" }); }
  return <section className="page">
    <div className="page-heading"><div><span className="eyebrow">SEU PLAYBOOK</span><h1>Regras do sistema de trade</h1><p>Registre aquilo que deve continuar verdadeiro mesmo quando o mercado ou suas emoções mudarem.</p></div></div>
    <div className="panel form-panel"><h2>{editing ? "Editar regra" : "Adicionar regra"}</h2>
      <div className="form-grid">
        <Field label="Nome da regra"><input value={draft.title} onChange={e => setDraft({...draft, title:e.target.value})} placeholder="Ex.: Não aumentar stop após entrar" /></Field>
        <Field label="Categoria"><select value={draft.category} onChange={e => setDraft({...draft, category:e.target.value as RuleCategory})}>{ruleCategories.map(x => <option key={x}>{x}</option>)}</select></Field>
        <Field label="Regra"><textarea rows={4} value={draft.description} onChange={e => setDraft({...draft, description:e.target.value})} placeholder="Escreva de forma objetiva o que deve ou não deve ser feito." /></Field>
        <Field label="Por que esta regra existe?" hint="Registrar a justificativa ajuda a obedecer a regra quando houver pressão."><textarea rows={4} value={draft.rationale} onChange={e => setDraft({...draft, rationale:e.target.value})} placeholder="Que problema, erro recorrente ou princípio técnico esta regra protege?" /></Field>
      </div>
      <label className="check"><input type="checkbox" checked={draft.active} onChange={e => setDraft({...draft, active:e.target.checked})} /> Regra ativa</label>
      <AttachmentField value={draft.attachments} onChange={attachments => setDraft({...draft, attachments})} title="Imagens explicativas da regra" />
      <div className="actions"><button className="primary" onClick={save}>{editing ? "Salvar alterações" : "Adicionar regra"}</button>{editing && <button onClick={() => {setEditing(null);setDraft(blank());}}>Cancelar</button>}</div>
    </div>
    <div className="cards">{state.rules.map(rule => <article className={`rule-card ${!rule.active ? "muted" : ""}`} key={rule.id}><div className="card-top"><span className="badge">{rule.category}</span><span className={`status-dot ${rule.active ? "on" : ""}`}>{rule.active ? "ativa" : "inativa"}</span></div><h3>{rule.title}</h3><p>{rule.description}</p>{rule.rationale && <div className="why"><b>Por quê:</b> {rule.rationale}</div>}{!!rule.attachments.length && <div className="mini-images">{rule.attachments.slice(0,3).map(img => <img key={img.id} src={img.dataUrl} alt={img.name}/>)}</div>}<div className="card-actions"><button onClick={() => edit(rule)}>Editar</button><button className="danger" onClick={() => setState(s=>({...s,rules:s.rules.filter(r=>r.id!==rule.id)}))}>Remover</button></div></article>)}</div>
    {!state.rules.length && <div className="empty">Você ainda não cadastrou regras. Comece pelas regras de risco e pelas situações em que não deve operar.</div>}
  </section>;
}

function ScenarioEditor({ scenario, onChange }: { scenario: Scenario; onChange: (next: Scenario) => void }) {
  const patch = (key: keyof Scenario, value: string) => onChange({ ...scenario, [key]: value });
  return <div className="scenario"><div className="scenario-label">Cenário {scenario.label}</div>
    <Field label="Nome do cenário"><input value={scenario.title} onChange={e=>patch("title",e.target.value)} placeholder="Ex.: Rompimento com aceitação acima da máxima" /></Field>
    <div className="form-grid two">
      <Field label="Se isto acontecer…"><textarea rows={3} value={scenario.trigger} onChange={e=>patch("trigger",e.target.value)} placeholder="Condição objetiva que ativa a hipótese." /></Field>
      <Field label="Quero ver como confirmação…"><textarea rows={3} value={scenario.confirmation} onChange={e=>patch("confirmation",e.target.value)} placeholder="O que precisa confirmar antes da entrada?" /></Field>
      <Field label="Então farei…"><textarea rows={3} value={scenario.action} onChange={e=>patch("action",e.target.value)} placeholder="Plano de ação: entrada, espera, direção, técnica." /></Field>
      <Field label="O cenário deixa de valer quando…"><textarea rows={3} value={scenario.invalidation} onChange={e=>patch("invalidation",e.target.value)} placeholder="Critério que invalida a tese." /></Field>
      <Field label="Stop / risco"><input value={scenario.stop} onChange={e=>patch("stop",e.target.value)} placeholder="Ex.: abaixo de 128.450; 1R" /></Field>
      <Field label="Alvos / gestão"><input value={scenario.targets} onChange={e=>patch("targets",e.target.value)} placeholder="Ex.: parcial em 1R e alvo em 2R" /></Field>
    </div>
    <Field label="O que NÃO fazer neste cenário"><textarea rows={2} value={scenario.avoid} onChange={e=>patch("avoid",e.target.value)} placeholder="Ex.: não antecipar rompimento; não perseguir preço." /></Field>
  </div>;
}

function PlanEditor({ initial, assets, onSave, onCancel }: { initial: TradePlan; assets: string[]; onSave: (p: TradePlan) => void; onCancel: () => void }) {
  const [draft, setDraft] = useState<TradePlan>(() => structuredClone(initial));
  const [section, setSection] = useState<"plan"|"review">("plan");
  function patchScenario(id: string, next: Scenario) { setDraft(d => ({...d, scenarios:d.scenarios.map(s=>s.id===id?next:s)})); }
  function save() { if (!draft.asset.trim() || !draft.tradingDate) return; onSave({...draft, updatedAt:new Date().toISOString()}); }
  return <div className="panel plan-editor">
    <div className="editor-head"><div><span className="eyebrow">{initial.createdAt === initial.updatedAt ? "NOVO PLANO" : "EDITANDO PLANO"}</span><h2>{draft.asset || "Ativo"} • {fmtDate(draft.tradingDate)}</h2></div><div className="segmented"><button className={section==="plan"?"active":""} onClick={()=>setSection("plan")}>Planejamento</button><button className={section==="review"?"active":""} onClick={()=>setSection("review")}>O que aconteceu</button></div></div>
    {section === "plan" ? <>
      <div className="form-grid three">
        <Field label="Ativo"><input list="assets" value={draft.asset} onChange={e=>setDraft({...draft,asset:e.target.value.toUpperCase()})}/><datalist id="assets">{assets.map(a=><option key={a} value={a}/>)}</datalist></Field>
        <Field label="Data do pregão"><input type="date" value={draft.tradingDate} onChange={e=>setDraft({...draft,tradingDate:e.target.value})}/></Field>
        <Field label="Viés inicial"><select value={draft.bias} onChange={e=>setDraft({...draft,bias:e.target.value as TradePlan["bias"]})}><option>Alta</option><option>Baixa</option><option>Neutro</option></select></Field>
      </div>
      <div className="form-grid two">
        <Field label="Contexto de mercado"><textarea rows={6} value={draft.marketContext} onChange={e=>setDraft({...draft,marketContext:e.target.value})} placeholder="Tendência, localização do preço, volatilidade, fluxo, correlações, fechamento anterior…"/></Field>
        <Field label="Níveis importantes"><textarea rows={6} value={draft.keyLevels} onChange={e=>setDraft({...draft,keyLevels:e.target.value})} placeholder="Máxima/mínima anterior, VWAP, gaps, suportes, resistências, regiões de liquidez…"/></Field>
        <Field label="Eventos e horários de atenção"><textarea rows={4} value={draft.macroEvents} onChange={e=>setDraft({...draft,macroEvents:e.target.value})} placeholder="Ex.: Copom, payroll, abertura NY, leilões, vencimentos…"/></Field>
        <Field label="Condições para NÃO operar"><textarea rows={4} value={draft.noTradeConditions} onChange={e=>setDraft({...draft,noTradeConditions:e.target.value})} placeholder="Ex.: spread anormal, contexto confuso, perda de limite diário…"/></Field>
      </div>
      <div className="form-grid two"><Field label="Risco máximo do dia"><input value={draft.maxRisk} onChange={e=>setDraft({...draft,maxRisk:e.target.value})} placeholder="Ex.: 2R ou R$ 600"/></Field><Field label="Máximo de operações"><input type="number" min={1} value={draft.maxTrades} onChange={e=>setDraft({...draft,maxTrades:Math.max(1,Number(e.target.value)||1)})}/></Field></div>
      <div className="checklist-box"><h3>Checklist pré-mercado</h3>{draft.checklist.map((item,i)=><div className="editable-check" key={i}><span>{i+1}</span><input value={item} onChange={e=>setDraft({...draft,checklist:draft.checklist.map((x,j)=>j===i?e.target.value:x)})}/><button className="tiny danger" onClick={()=>setDraft({...draft,checklist:draft.checklist.filter((_,j)=>j!==i)})}>×</button></div>)}<button className="small" onClick={()=>setDraft({...draft,checklist:[...draft.checklist,""]})}>+ Item</button></div>
      <div className="scenario-grid">{draft.scenarios.map(s=><ScenarioEditor key={s.id} scenario={s} onChange={n=>patchScenario(s.id,n)}/>)}</div>
      <Field label="Plano comportamental: se eu sentir/começar a fazer X, então farei Y"><textarea rows={5} value={draft.behaviorPlan} onChange={e=>setDraft({...draft,behaviorPlan:e.target.value})} placeholder="Ex.: Se eu perceber vontade de recuperar prejuízo imediatamente, não enviarei nova ordem; vou me afastar da tela por 5 minutos e reler o limite diário."/></Field>
      <AttachmentField value={draft.attachments} onChange={attachments=>setDraft({...draft,attachments})} title="Gráficos e imagens do planejamento" />
    </> : <>
      <div className="review-callout">Preencha esta parte <b>depois do pregão</b>. O objetivo é comparar sua hipótese com o mercado real sem reescrever o passado.</div>
      <div className="form-grid two">
        <Field label="O que efetivamente aconteceu?"><textarea rows={7} value={draft.review.happened} onChange={e=>setDraft({...draft,review:{...draft.review,happened:e.target.value}})} placeholder="Descreva a sequência do mercado e os pontos que mais importaram."/></Field>
        <Field label="Desvios entre plano e execução"><textarea rows={7} value={draft.review.deviations} onChange={e=>setDraft({...draft,review:{...draft.review,deviations:e.target.value}})} placeholder="O que você fez diferente do planejado? Por quê?"/></Field>
        <Field label="Qual cenário predominou?"><select value={draft.review.observedScenario} onChange={e=>setDraft({...draft,review:{...draft.review,observedScenario:e.target.value as PlanReview["observedScenario"]}})}><option value="">Selecione</option><option>A</option><option>B</option><option>C</option><option>Nenhum</option><option>Mistura</option></select></Field>
        <Field label="Você seguiu o plano?"><select value={draft.review.followedPlan} onChange={e=>setDraft({...draft,review:{...draft.review,followedPlan:e.target.value as PlanReview["followedPlan"]}})}><option value="">Selecione</option><option>Sim</option><option>Parcialmente</option><option>Não</option><option>Não operei</option></select></Field>
        <Field label="Resultado / observação de resultado"><input value={draft.review.result} onChange={e=>setDraft({...draft,review:{...draft.review,result:e.target.value}})} placeholder="Ex.: +1,4R; -R$ 250; não operei"/></Field>
        <Field label="Principal aprendizado"><textarea rows={4} value={draft.review.lessons} onChange={e=>setDraft({...draft,review:{...draft.review,lessons:e.target.value}})} placeholder="O que merece virar regra, checklist ou hipótese futura?"/></Field>
      </div>
      <AttachmentField value={draft.review.attachments} onChange={attachments=>setDraft({...draft,review:{...draft.review,attachments}})} title="Gráficos e imagens do que aconteceu" />
      <label className="check"><input type="checkbox" checked={!!draft.review.reviewedAt} onChange={e=>setDraft({...draft,review:{...draft.review,reviewedAt:e.target.checked?new Date().toISOString():undefined}})} /> Marcar revisão como concluída</label>
    </>}
    <div className="actions sticky-actions"><button className="primary" onClick={save}>Salvar plano</button><button onClick={onCancel}>Fechar sem salvar</button></div>
  </div>;
}

function PlansPage({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const [editing, setEditing] = useState<TradePlan | null>(null);
  const [filter, setFilter] = useState("");
  const plans = useMemo(()=>[...state.plans].filter(p=>!filter||p.asset.toLowerCase().includes(filter.toLowerCase())||p.tradingDate.includes(filter)).sort((a,b)=>b.tradingDate.localeCompare(a.tradingDate)),[state.plans,filter]);
  if (editing) return <section className="page"><PlanEditor initial={editing} assets={state.settings.assets} onCancel={()=>setEditing(null)} onSave={p=>{setState(s=>({...s,plans:s.plans.some(x=>x.id===p.id)?s.plans.map(x=>x.id===p.id?p:x):[p,...s.plans]}));setEditing(null);}}/></section>;
  return <section className="page"><div className="page-heading"><div><span className="eyebrow">ANTES E DEPOIS DO MERCADO</span><h1>Planos de trade</h1><p>Crie hipóteses antes do pregão e preserve uma revisão separada para registrar o que realmente aconteceu.</p></div><button className="primary" onClick={()=>setEditing(newPlan(state))}>+ Novo plano</button></div>
    <div className="toolbar"><input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Filtrar por ativo ou data…"/><span>{plans.length} plano(s)</span></div>
    <div className="plan-list">{plans.map(p=><article className="plan-card" key={p.id}><div className="plan-date"><strong>{fmtDate(p.tradingDate)}</strong><span>{p.asset}</span></div><div className="plan-main"><div className="card-top"><span className={`badge bias-${p.bias.toLowerCase()}`}>Viés {p.bias}</span>{p.review.reviewedAt?<span className="badge ok">Revisado</span>:<span className="badge">Aguardando revisão</span>}</div><h3>{p.scenarios.find(s=>s.label==="A")?.title || "Plano sem título de cenário A"}</h3><p>{p.marketContext || "Contexto ainda não descrito."}</p><div className="scenario-pills">{p.scenarios.map(s=><span key={s.id}>{s.label}: {s.title||"não definido"}</span>)}</div></div><div className="vertical-actions"><button onClick={()=>setEditing(structuredClone(p))}>Abrir / editar</button><button onClick={()=>downloadText(`plano-${p.asset}-${p.tradingDate}.txt`, buildPlanText(p))}>Exportar texto</button><button className="danger" onClick={()=>{if(confirm("Remover este plano?")) setState(s=>({...s,plans:s.plans.filter(x=>x.id!==p.id)}));}}>Remover</button></div></article>)}</div>
    {!plans.length && <div className="empty">Nenhum plano encontrado. Crie um plano para o próximo pregão.</div>}
  </section>;
}

function buildPlanText(p: TradePlan) {
  const scenarios = p.scenarios.map(s=>`CENÁRIO ${s.label} — ${s.title}\nSe: ${s.trigger}\nConfirmação: ${s.confirmation}\nEntão: ${s.action}\nInvalidação: ${s.invalidation}\nStop/risco: ${s.stop}\nAlvos: ${s.targets}\nEvitar: ${s.avoid}`).join("\n\n");
  return `PLANO DE TRADE — ${p.asset} — ${fmtDate(p.tradingDate)}\n\nViés: ${p.bias}\nRisco máximo: ${p.maxRisk}\nMáximo de operações: ${p.maxTrades}\n\nCONTEXTO\n${p.marketContext}\n\nNÍVEIS\n${p.keyLevels}\n\nEVENTOS\n${p.macroEvents}\n\nNÃO OPERAR SE\n${p.noTradeConditions}\n\n${scenarios}\n\nPLANO COMPORTAMENTAL\n${p.behaviorPlan}\n\nREVISÃO\nO que aconteceu: ${p.review.happened}\nCenário observado: ${p.review.observedScenario}\nSeguiu o plano: ${p.review.followedPlan}\nDesvios: ${p.review.deviations}\nResultado: ${p.review.result}\nAprendizado: ${p.review.lessons}\n`;
}

function SettingsPage({ state, setState }: { state: AppState; setState: React.Dispatch<React.SetStateAction<AppState>> }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [assetsText,setAssetsText]=useState(state.settings.assets.join(", "));
  const [message,setMessage]=useState("");
  async function importFile(file: File | undefined) {
    if (!file) return;
    try { const next=parseBackup(await file.text()); setState(next); setAssetsText(next.settings.assets.join(", ")); setMessage("Backup importado com sucesso."); }
    catch(e){setMessage(e instanceof Error?e.message:"Falha ao importar backup.");}
  }
  const settings=state.settings;
  const patch=(next: Partial<typeof settings>)=>setState(s=>({...s,settings:{...s.settings,...next}}));
  return <section className="page"><div className="page-heading"><div><span className="eyebrow">PREFERÊNCIAS E DADOS</span><h1>Configurações</h1><p>Os dados ficam neste navegador. Use backups JSON para transportar ou restaurar todo o conteúdo, inclusive imagens.</p></div></div>
    <div className="two-cols align-start"><div className="panel"><h2>Padrões de planejamento</h2>
      <Field label="Nome do trader"><input value={settings.traderName} onChange={e=>patch({traderName:e.target.value})} placeholder="Opcional"/></Field>
      <Field label="Ativos disponíveis" hint="Separe os ativos por vírgula."><textarea rows={4} value={assetsText} onChange={e=>setAssetsText(e.target.value)} onBlur={()=>patch({assets:assetsText.split(",").map(x=>x.trim().toUpperCase()).filter(Boolean)})}/></Field>
      <div className="form-grid two"><Field label="Risco máximo padrão"><input value={settings.defaultMaxRisk} onChange={e=>patch({defaultMaxRisk:e.target.value})} placeholder="Ex.: 2R"/></Field><Field label="Máx. de trades padrão"><input type="number" min={1} value={settings.defaultMaxTrades} onChange={e=>patch({defaultMaxTrades:Math.max(1,Number(e.target.value)||1)})}/></Field></div>
      <Field label="Tema"><select value={settings.theme} onChange={e=>patch({theme:e.target.value as "dark"|"light"})}><option value="dark">Escuro</option><option value="light">Claro</option></select></Field>
      <AttachmentField value={settings.attachments} onChange={attachments=>patch({attachments})} title="Imagens de referência geral" />
    </div>
    <div className="panel"><h2>Backup e recuperação</h2><p className="muted-text">O JSON é o formato de recuperação completa. Ele inclui regras, planos, revisões, configurações e imagens anexadas.</p>
      <div className="stack-actions"><button className="primary" onClick={()=>exportBackup(state)}>Exportar backup JSON</button><button onClick={()=>fileRef.current?.click()}>Importar backup JSON</button><input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={e=>void importFile(e.target.files?.[0])}/></div>
      {message&&<div className="notice">{message}</div>}
      <div className="danger-zone"><h3>Zona de risco</h3><p>Apaga todos os dados deste navegador. Exporte um backup antes, se necessário.</p><button className="danger" onClick={()=>{if(confirm("Apagar todos os dados locais? Esta ação não pode ser desfeita.")){localStorage.removeItem(STORAGE_KEY);const fresh=initialState();setState(fresh);setAssetsText(fresh.settings.assets.join(", "));}}}>Apagar todos os dados</button></div>
    </div></div>
  </section>;
}

export default function App() {
  const [state,setState]=useState<AppState>(()=>loadState());
  const [tab,setTab]=useState<Tab>("dashboard");
  const [saveError,setSaveError]=useState("");
  useEffect(()=>{document.documentElement.dataset.theme=state.settings.theme; try{saveState(state);setSaveError("");}catch(e){setSaveError("O navegador não conseguiu salvar os dados. Exporte um backup e reduza a quantidade de imagens.");}},[state]);
  const nav: Array<[Tab,string,string]> = [["dashboard","Visão geral","⌂"],["rules","Sistema de trade","◆"],["plans","Planos de trade","▤"],["settings","Configurações","⚙"]];
  return <div className="app-shell"><aside><div className="brand"><div className="brand-mark">PT</div><div><strong>Plano de Trade</strong><span>preparar • executar • revisar</span></div></div><nav>{nav.map(([id,label,icon])=><button key={id} className={tab===id?"active":""} onClick={()=>setTab(id)}><span>{icon}</span>{label}</button>)}</nav><div className="sidebar-foot"><span>Dados locais</span><b>schema v{state.schemaVersion}</b></div></aside>
    <main><header><div><span className="mobile-title">Plano de Trade</span></div><div className="save-state"><span className={saveError?"bad":"good"}></span>{saveError||"Salvamento local automático"}</div></header>
      {tab==="dashboard"&&<Dashboard state={state} onOpenPlans={()=>setTab("plans")}/>} {tab==="rules"&&<RulesPage state={state} setState={setState}/>} {tab==="plans"&&<PlansPage state={state} setState={setState}/>} {tab==="settings"&&<SettingsPage state={state} setState={setState}/>} 
    </main></div>;
}

import { useEffect } from "react";

export type UiLanguage = "pt-BR" | "en" | "es";

export const LANGUAGE_OPTIONS: Array<{ value: UiLanguage; label: string }> = [
  { value: "pt-BR", label: "Português (Brasil)" },
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
];

export function localeForLanguage(language: UiLanguage) {
  if (language === "en") return "en-US";
  if (language === "es") return "es-ES";
  return "pt-BR";
}

const en: Record<string, string> = {
  "Plano de Trade": "Trade Plan",
  "preparar • executar • revisar": "prepare • execute • review",
  "preparar • congelar • executar • revisar": "prepare • freeze • execute • review",
  "Visão geral": "Overview",
  "Sistema de trade": "Trading system",
  "Biblioteca de setups": "Setup library",
  "Planos de trade": "Trade plans",
  "Configurações": "Settings",
  "PREPARAÇÃO ANTES DA EXECUÇÃO": "PREPARATION BEFORE EXECUTION",
  "Transforme hipóteses em decisões previamente pensadas.": "Turn hypotheses into pre-planned decisions.",
  "Planeje o pregão antes da abertura, confronte sua própria tese, congele a preparação e compare depois o mercado real com aquilo que você havia decidido fazer.": "Plan the trading session before the open, challenge your own thesis, freeze the preparation, and later compare the real market with what you had decided to do.",
  "Criar plano para o próximo pregão": "Create plan for the next session",
  "regras ativas": "active rules",
  "setups ativos": "active setups",
  "planos congelados": "frozen plans",
  "aderência integral": "full adherence",
  "AGENDA": "AGENDA",
  "Próximos planos": "Upcoming plans",
  "Nenhum plano futuro. Crie o primeiro plano para o próximo pregão.": "No future plans. Create the first plan for the next trading session.",
  "MÉTODO": "METHOD",
  "Ciclo recomendado": "Recommended cycle",
  "Setup + contexto": "Setup + context",
  "Use um padrão conhecido sem ignorar as condições particulares do dia.": "Use a known pattern without ignoring the day's specific conditions.",
  "Contraprova": "Counterevidence",
  "Procure evidências contra sua tese antes de defendê-la.": "Look for evidence against your thesis before defending it.",
  "Congelamento": "Freezing",
  "Preserve exatamente o que havia sido decidido antes do pregão.": "Preserve exactly what had been decided before the trading session.",
  "Comparação": "Comparison",
  "Separe mercado real, sua execução e qualidade do plano.": "Separate the real market, your execution, and plan quality.",
  "Abrir biblioteca de setups": "Open setup library",
  "SEU PLAYBOOK": "YOUR PLAYBOOK",
  "Regras do sistema de trade": "Trading system rules",
  "Registre aquilo que deve continuar verdadeiro mesmo quando o mercado ou suas emoções mudarem.": "Record what should remain true even when the market or your emotions change.",
  "Editar regra": "Edit rule",
  "Adicionar regra": "Add rule",
  "Nome da regra": "Rule name",
  "Categoria": "Category",
  "Regra": "Rule",
  "Por que esta regra existe?": "Why does this rule exist?",
  "Registrar a justificativa ajuda a obedecer a regra quando houver pressão.": "Recording the rationale helps you follow the rule under pressure.",
  "Regra ativa": "Active rule",
  "Imagens explicativas da regra": "Rule reference images",
  "Salvar alterações": "Save changes",
  "Cancelar": "Cancel",
  "Remover": "Remove",
  "Editar": "Edit",
  "ativa": "active",
  "inativa": "inactive",
  "Por quê:": "Why:",
  "Você ainda não cadastrou regras. Comece pelas regras de risco e pelas situações em que não deve operar.": "You have not registered any rules yet. Start with risk rules and situations in which you should not trade.",
  "Entrada": "Entry",
  "Saída": "Exit",
  "Risco": "Risk",
  "Horário": "Time",
  "Contexto": "Context",
  "Comportamento": "Behavior",
  "Outro": "Other",
  "PADRÕES REPETÍVEIS": "REPEATABLE PATTERNS",
  "Guarde o padrão operacional que você quer reconhecer repetidamente. O setup serve como template; o plano diário adapta esse padrão ao contexto real do pregão.": "Store the trading pattern you want to recognize repeatedly. The setup acts as a template; the daily plan adapts that pattern to the actual session context.",
  "Editar setup": "Edit setup",
  "Novo setup": "New setup",
  "Nome do setup": "Setup name",
  "Descrição curta": "Short description",
  "Contexto em que funciona melhor": "Best market context",
  "Critérios de entrada": "Entry criteria",
  "Confirmações necessárias": "Required confirmations",
  "Invalidação": "Invalidation",
  "Modelo de stop / risco": "Stop / risk model",
  "Modelo de alvo / gestão": "Target / management model",
  "O que evitar": "What to avoid",
  "Cuidados comportamentais": "Behavioral safeguards",
  "Setup ativo": "Active setup",
  "Exemplos visuais do setup": "Visual setup examples",
  "Adicionar setup": "Add setup",
  "Setup": "Setup",
  "ativo": "active",
  "inativo": "inactive",
  "Entrada:": "Entry:",
  "Invalida quando:": "Invalid when:",
  "Nenhum setup cadastrado. Registre primeiro os padrões que você realmente deseja repetir e reconhecer.": "No setups registered. First record the patterns you truly want to repeat and recognize.",
  "Cenário": "Scenario",
  "Nome do cenário": "Scenario name",
  "Se isto acontecer…": "If this happens…",
  "Quero ver como confirmação…": "I want to see as confirmation…",
  "Então farei…": "Then I will…",
  "O cenário deixa de valer quando…": "The scenario is no longer valid when…",
  "Stop / risco": "Stop / risk",
  "Alvos / gestão": "Targets / management",
  "O que NÃO fazer neste cenário": "What NOT to do in this scenario",
  "NOVO PLANO": "NEW PLAN",
  "EDITANDO PLANO": "EDITING PLAN",
  "Planejamento": "Planning",
  "O que aconteceu": "What happened",
  "Ativo": "Asset",
  "Data do pregão": "Trading date",
  "Viés inicial": "Initial bias",
  "Alta": "Bullish",
  "Baixa": "Bearish",
  "Neutro": "Neutral",
  "Setup de referência (opcional)": "Reference setup (optional)",
  "Nenhum": "None",
  "Aplicar setup ao cenário A": "Apply setup to scenario A",
  "O setup é um template. Depois de aplicá-lo, adapte o plano ao contexto do pregão.": "A setup is a template. After applying it, adapt the plan to the trading session context.",
  "Contexto de mercado": "Market context",
  "Níveis importantes": "Key levels",
  "Eventos e horários de atenção": "Events and times to watch",
  "Evidências contra minha tese / por que posso estar errado?": "Evidence against my thesis / why could I be wrong?",
  "Procure deliberadamente dados que contradigam seu viés. O objetivo é reduzir viés de confirmação.": "Deliberately look for data that contradicts your bias. The goal is to reduce confirmation bias.",
  "Condições para NÃO operar": "Conditions for NOT trading",
  "Risco máximo do dia": "Maximum daily risk",
  "Máximo de operações": "Maximum number of trades",
  "Checklist pré-mercado": "Pre-market checklist",
  "Plano comportamental: se eu sentir/começar a fazer X, então farei Y": "Behavior plan: if I feel/start doing X, then I will do Y",
  "Gráficos e imagens do planejamento": "Planning charts and images",
  "Salvar plano": "Save plan",
  "Fechar sem salvar": "Close without saving",
  "Congelar versão": "Freeze version",
  "Criar nova versão": "Create new version",
  "Histórico de versões": "Version history",
  "Rascunho editável": "Editable draft",
  "Rascunho sem versão": "Draft without version",
  "Sem versão congelada": "No frozen version",
  "congelado": "frozen",
  "rascunho": "draft",
  "revisado": "reviewed",
  "PLANO EM CONSTRUÇÃO": "PLAN IN PROGRESS",
  "Edite livremente. Quando terminar a preparação, congele uma versão antes do pregão.": "Edit freely. When preparation is complete, freeze a version before the trading session.",
  "RASCUNHO ATUAL — SEM VERSÃO CONGELADA": "CURRENT DRAFT — NO FROZEN VERSION",
  "ATENÇÃO": "ATTENTION",
  "Planejado": "Planned",
  "Mercado real": "Actual market",
  "Minha execução": "My execution",
  "O que o mercado efetivamente fez?": "What did the market actually do?",
  "Qual cenário predominou?": "Which scenario prevailed?",
  "Você seguiu o plano?": "Did you follow the plan?",
  "Desvios entre plano e execução": "Deviations between plan and execution",
  "Resultado / observação de resultado": "Result / result note",
  "Principal aprendizado": "Main lesson",
  "Gráficos e imagens do que aconteceu": "Charts and images of what happened",
  "Marcar revisão como concluída": "Mark review as completed",
  "Revisão salva.": "Review saved.",
  "Plano salvo.": "Plan saved.",
  "Sim": "Yes",
  "Parcialmente": "Partially",
  "Não": "No",
  "Não operei": "I did not trade",
  "Mistura": "Mixed",
  "Ainda não revisado": "Not reviewed yet",
  "Ainda não avaliado": "Not evaluated yet",
  "Não registrado": "Not recorded",
  "Nenhum desvio registrado": "No deviations recorded",
  "Cenários não definidos": "Scenarios not defined",
  "Contexto ainda não descrito.": "Context not described yet.",
  "ANTES E DEPOIS DO MERCADO": "BEFORE AND AFTER THE MARKET",
  "Crie hipóteses antes do pregão e preserve uma revisão separada para registrar o que realmente aconteceu.": "Create hypotheses before the session and keep a separate review to record what actually happened.",
  "+ Novo plano": "+ New plan",
  "Filtrar por ativo ou data…": "Filter by asset or date…",
  "plano(s)": "plan(s)",
  "Abrir / editar": "Open / edit",
  "Exportar texto": "Export text",
  "Remover este plano?": "Remove this plan?",
  "Nenhum plano encontrado. Crie um plano para o próximo pregão.": "No plans found. Create a plan for the next trading session.",
  "PREFERÊNCIAS E DADOS": "PREFERENCES AND DATA",
  "Os dados ficam neste navegador. Use backups JSON para transportar ou restaurar todo o conteúdo, inclusive imagens.": "Data stays in this browser. Use JSON backups to move or restore all content, including images.",
  "Padrões de planejamento": "Planning defaults",
  "Nome do trader": "Trader name",
  "Opcional": "Optional",
  "Ativos disponíveis": "Available assets",
  "Separe os ativos por vírgula.": "Separate assets with commas.",
  "Risco máximo padrão": "Default maximum risk",
  "Máx. de trades padrão": "Default max trades",
  "Tema": "Theme",
  "Escuro": "Dark",
  "Claro": "Light",
  "Idioma": "Language",
  "Idioma da interface": "Interface language",
  "Imagens de referência geral": "General reference images",
  "Backup e recuperação": "Backup and recovery",
  "O JSON é o formato de recuperação completa. Ele inclui regras, setups, planos, versões, revisões, configurações e imagens.": "JSON is the complete recovery format. It includes rules, setups, plans, versions, reviews, settings, and images.",
  "Exportar backup JSON": "Export JSON backup",
  "Importar backup JSON": "Import JSON backup",
  "Backup importado com sucesso. Backups v1 são migrados automaticamente para o schema atual.": "Backup imported successfully. Older backups are automatically migrated to the current schema.",
  "Backup importado com sucesso. Backups anteriores são migrados automaticamente para o schema atual.": "Backup imported successfully. Older backups are automatically migrated to the current schema.",
  "O JSON é o formato de recuperação completa. O schema v3 inclui biblioteca de setups, histórico de versões congeladas e preferência de idioma.": "JSON is the complete recovery format. Schema v3 includes the setup library, frozen-version history, and language preference.",
  "Zona de risco": "Danger zone",
  "Apaga todos os dados deste navegador. Exporte um backup antes, se necessário.": "Deletes all data from this browser. Export a backup first if needed.",
  "Apagar todos os dados": "Delete all data",
  "Apagar todos os dados locais? Esta ação não pode ser desfeita.": "Delete all local data? This action cannot be undone.",
  "Salvamento local automático": "Automatic local saving",
  "Dados locais": "Local data",
  "Preparando imagens…": "Preparing images…",
  "+ Anexar imagens": "+ Attach images",
  "Remover este setup?": "Remove this setup?",
  "Falha ao anexar imagem.": "Failed to attach image.",
  "Falha ao importar backup.": "Failed to import backup.",
  "O navegador não conseguiu salvar os dados. Exporte um backup e reduza a quantidade de imagens.": "The browser could not save the data. Export a backup and reduce the number of images.",
  "Setup aplicado ao cenário A. Adapte os campos ao contexto específico deste pregão.": "Setup applied to scenario A. Adapt the fields to this session's specific context.",
  "O setup foi selecionado, mas o plano não possui cenário A para receber o template.": "The setup was selected, but the plan has no scenario A to receive the template.",
  "PNG/JPG/WebP • compactação automática": "PNG/JPG/WebP • automatic compression",
  "Li minhas regras do sistema antes de operar": "I read my system rules before trading",
  "Mapeei eventos macroeconômicos e horários de risco": "I mapped macroeconomic events and risk times",
  "Defini onde não devo operar": "I defined where I should not trade",
  "Defini risco máximo e número máximo de trades": "I defined maximum risk and maximum number of trades",
  "Procurei evidências que contradizem minha tese principal": "I looked for evidence that contradicts my main thesis",
  "Escreva de forma objetiva o que deve ou não deve ser feito.": "Write objectively what should or should not be done.",
  "Que problema, erro recorrente ou princípio técnico esta regra protege?": "What problem, recurring error, or technical principle does this rule protect?",
  "Qual ideia operacional este setup representa?": "What trading idea does this setup represent?",
  "Tendência, volatilidade, localização, horário, correlações…": "Trend, volatility, location, time, correlations…",
  "Condições objetivas para considerar a entrada.": "Objective conditions for considering an entry.",
  "O que precisa acontecer antes da execução?": "What needs to happen before execution?",
  "Quando o setup deixa de existir?": "When does the setup cease to exist?",
  "Onde e por que o stop deve ficar?": "Where and why should the stop be placed?",
  "Parciais, trailing, alvos técnicos…": "Partials, trailing, technical targets…",
  "Erros típicos: antecipar, perseguir preço, operar fora do horário…": "Typical errors: anticipating, chasing price, trading outside the planned time…",
  "Como devo agir para executar este setup corretamente?": "How should I behave to execute this setup correctly?",
  "Condição objetiva que ativa a hipótese.": "Objective condition that activates the hypothesis.",
  "O que precisa confirmar antes da entrada?": "What must confirm before entry?",
  "Plano de ação: entrada, espera, direção, técnica.": "Action plan: entry, wait, direction, technique.",
  "Critério que invalida a tese.": "Criterion that invalidates the thesis.",
  "Ex.: abaixo de 128.450; 1R": "E.g.: below 128,450; 1R",
  "Ex.: parcial em 1R e alvo em 2R": "E.g.: partial at 1R and target at 2R",
  "Ex.: não antecipar rompimento; não perseguir preço.": "E.g.: do not anticipate breakout; do not chase price.",
  "Tendência, localização do preço, volatilidade, fluxo, correlações, fechamento anterior…": "Trend, price location, volatility, flow, correlations, previous close…",
  "Máxima/mínima anterior, VWAP, gaps, suportes, resistências, regiões de liquidez…": "Previous high/low, VWAP, gaps, supports, resistances, liquidity areas…",
  "Ex.: Copom, payroll, abertura NY, leilões, vencimentos…": "E.g.: central-bank decision, payroll, NY open, auctions, expirations…",
  "Ex.: spread anormal, contexto confuso, perda de limite diário…": "E.g.: abnormal spread, unclear context, daily-loss limit reached…",
  "O que merece virar regra, ajuste de setup, checklist ou hipótese futura?": "What should become a rule, setup adjustment, checklist item, or future hypothesis?",
  "Descreva a sequência do mercado, mudanças de contexto e os pontos que mais importaram.": "Describe the market sequence, context changes, and the points that mattered most.",
  "Entradas, saídas, esperas, cancelamentos e decisões que você realmente tomou.": "Entries, exits, waits, cancellations, and decisions you actually made.",
  "O que você fez diferente do planejado? Por quê?": "What did you do differently from the plan? Why?",
  "Ex.: +1,4R; -R$ 250; não operei": "E.g.: +1.4R; -$250; did not trade"
};

const es: Record<string, string> = {
  "Plano de Trade": "Plan de Trading",
  "preparar • executar • revisar": "preparar • ejecutar • revisar",
  "preparar • congelar • executar • revisar": "preparar • congelar • ejecutar • revisar",
  "Visão geral": "Resumen",
  "Sistema de trade": "Sistema de trading",
  "Biblioteca de setups": "Biblioteca de setups",
  "Planos de trade": "Planes de trading",
  "Configurações": "Configuración",
  "PREPARAÇÃO ANTES DA EXECUÇÃO": "PREPARACIÓN ANTES DE LA EJECUCIÓN",
  "Transforme hipóteses em decisões previamente pensadas.": "Convierte hipótesis en decisiones pensadas de antemano.",
  "Planeje o pregão antes da abertura, confronte sua própria tese, congele a preparação e compare depois o mercado real com aquilo que você havia decidido fazer.": "Planifica la sesión antes de la apertura, cuestiona tu propia tesis, congela la preparación y luego compara el mercado real con lo que habías decidido hacer.",
  "Criar plano para o próximo pregão": "Crear plan para la próxima sesión",
  "regras ativas": "reglas activas",
  "setups ativos": "setups activos",
  "planos congelados": "planes congelados",
  "aderência integral": "adherencia total",
  "AGENDA": "AGENDA",
  "Próximos planos": "Próximos planes",
  "Nenhum plano futuro. Crie o primeiro plano para o próximo pregão.": "No hay planes futuros. Crea el primer plan para la próxima sesión.",
  "MÉTODO": "MÉTODO",
  "Ciclo recomendado": "Ciclo recomendado",
  "Setup + contexto": "Setup + contexto",
  "Use um padrão conhecido sem ignorar as condições particulares do dia.": "Usa un patrón conocido sin ignorar las condiciones particulares del día.",
  "Contraprova": "Contraevidencia",
  "Procure evidências contra sua tese antes de defendê-la.": "Busca evidencias contra tu tesis antes de defenderla.",
  "Congelamento": "Congelación",
  "Preserve exatamente o que havia sido decidido antes do pregão.": "Conserva exactamente lo que se había decidido antes de la sesión.",
  "Comparação": "Comparación",
  "Separe mercado real, sua execução e qualidade do plano.": "Separa mercado real, tu ejecución y la calidad del plan.",
  "Abrir biblioteca de setups": "Abrir biblioteca de setups",
  "SEU PLAYBOOK": "TU PLAYBOOK",
  "Regras do sistema de trade": "Reglas del sistema de trading",
  "Registre aquilo que deve continuar verdadeiro mesmo quando o mercado ou suas emoções mudarem.": "Registra aquello que debe seguir siendo válido incluso cuando cambien el mercado o tus emociones.",
  "Editar regra": "Editar regla",
  "Adicionar regra": "Añadir regla",
  "Nome da regra": "Nombre de la regla",
  "Categoria": "Categoría",
  "Regra": "Regla",
  "Por que esta regra existe?": "¿Por qué existe esta regla?",
  "Registrar a justificativa ajuda a obedecer a regra quando houver pressão.": "Registrar la justificación ayuda a cumplir la regla cuando hay presión.",
  "Regra ativa": "Regla activa",
  "Imagens explicativas da regra": "Imágenes explicativas de la regla",
  "Salvar alterações": "Guardar cambios",
  "Cancelar": "Cancelar",
  "Remover": "Eliminar",
  "Editar": "Editar",
  "ativa": "activa",
  "inativa": "inactiva",
  "Por quê:": "Por qué:",
  "Você ainda não cadastrou regras. Comece pelas regras de risco e pelas situações em que não deve operar.": "Aún no has registrado reglas. Empieza por las reglas de riesgo y las situaciones en las que no debes operar.",
  "Entrada": "Entrada",
  "Saída": "Salida",
  "Risco": "Riesgo",
  "Horário": "Horario",
  "Contexto": "Contexto",
  "Comportamento": "Comportamiento",
  "Outro": "Otro",
  "PADRÕES REPETÍVEIS": "PATRONES REPETIBLES",
  "Guarde o padrão operacional que você quer reconhecer repetidamente. O setup serve como template; o plano diário adapta esse padrão ao contexto real do pregão.": "Guarda el patrón operativo que quieres reconocer repetidamente. El setup sirve como plantilla; el plan diario adapta ese patrón al contexto real de la sesión.",
  "Editar setup": "Editar setup",
  "Novo setup": "Nuevo setup",
  "Nome do setup": "Nombre del setup",
  "Descrição curta": "Descripción breve",
  "Contexto em que funciona melhor": "Contexto en el que funciona mejor",
  "Critérios de entrada": "Criterios de entrada",
  "Confirmações necessárias": "Confirmaciones necesarias",
  "Invalidação": "Invalidación",
  "Modelo de stop / risco": "Modelo de stop / riesgo",
  "Modelo de alvo / gestão": "Modelo de objetivo / gestión",
  "O que evitar": "Qué evitar",
  "Cuidados comportamentais": "Cuidados conductuales",
  "Setup ativo": "Setup activo",
  "Exemplos visuais do setup": "Ejemplos visuales del setup",
  "Adicionar setup": "Añadir setup",
  "Setup": "Setup",
  "ativo": "activo",
  "inativo": "inactivo",
  "Entrada:": "Entrada:",
  "Invalida quando:": "Se invalida cuando:",
  "Nenhum setup cadastrado. Registre primeiro os padrões que você realmente deseja repetir e reconhecer.": "No hay setups registrados. Registra primero los patrones que realmente deseas repetir y reconocer.",
  "Cenário": "Escenario",
  "Nome do cenário": "Nombre del escenario",
  "Se isto acontecer…": "Si esto ocurre…",
  "Quero ver como confirmação…": "Quiero ver como confirmación…",
  "Então farei…": "Entonces haré…",
  "O cenário deixa de valer quando…": "El escenario deja de ser válido cuando…",
  "Stop / risco": "Stop / riesgo",
  "Alvos / gestão": "Objetivos / gestión",
  "O que NÃO fazer neste cenário": "Qué NO hacer en este escenario",
  "NOVO PLANO": "NUEVO PLAN",
  "EDITANDO PLANO": "EDITANDO PLAN",
  "Planejamento": "Planificación",
  "O que aconteceu": "Qué ocurrió",
  "Ativo": "Activo",
  "Data do pregão": "Fecha de la sesión",
  "Viés inicial": "Sesgo inicial",
  "Alta": "Alcista",
  "Baixa": "Bajista",
  "Neutro": "Neutral",
  "Setup de referência (opcional)": "Setup de referencia (opcional)",
  "Nenhum": "Ninguno",
  "Aplicar setup ao cenário A": "Aplicar setup al escenario A",
  "O setup é um template. Depois de aplicá-lo, adapte o plano ao contexto do pregão.": "El setup es una plantilla. Después de aplicarlo, adapta el plan al contexto de la sesión.",
  "Contexto de mercado": "Contexto de mercado",
  "Níveis importantes": "Niveles importantes",
  "Eventos e horários de atenção": "Eventos y horarios de atención",
  "Evidências contra minha tese / por que posso estar errado?": "Evidencias contra mi tesis / ¿por qué podría estar equivocado?",
  "Procure deliberadamente dados que contradigam seu viés. O objetivo é reduzir viés de confirmação.": "Busca deliberadamente datos que contradigan tu sesgo. El objetivo es reducir el sesgo de confirmación.",
  "Condições para NÃO operar": "Condiciones para NO operar",
  "Risco máximo do dia": "Riesgo máximo del día",
  "Máximo de operações": "Máximo de operaciones",
  "Checklist pré-mercado": "Checklist premercado",
  "Plano comportamental: se eu sentir/começar a fazer X, então farei Y": "Plan conductual: si siento/empiezo a hacer X, entonces haré Y",
  "Gráficos e imagens do planejamento": "Gráficos e imágenes de la planificación",
  "Salvar plano": "Guardar plan",
  "Fechar sem salvar": "Cerrar sin guardar",
  "Congelar versão": "Congelar versión",
  "Criar nova versão": "Crear nueva versión",
  "Histórico de versões": "Historial de versiones",
  "Rascunho editável": "Borrador editable",
  "Rascunho sem versão": "Borrador sin versión",
  "Sem versão congelada": "Sin versión congelada",
  "congelado": "congelado",
  "rascunho": "borrador",
  "revisado": "revisado",
  "PLANO EM CONSTRUÇÃO": "PLAN EN CONSTRUCCIÓN",
  "Edite livremente. Quando terminar a preparação, congele uma versão antes do pregão.": "Edita libremente. Cuando termines la preparación, congela una versión antes de la sesión.",
  "RASCUNHO ATUAL — SEM VERSÃO CONGELADA": "BORRADOR ACTUAL — SIN VERSIÓN CONGELADA",
  "ATENÇÃO": "ATENCIÓN",
  "Planejado": "Planificado",
  "Mercado real": "Mercado real",
  "Minha execução": "Mi ejecución",
  "O que o mercado efetivamente fez?": "¿Qué hizo realmente el mercado?",
  "Qual cenário predominou?": "¿Qué escenario predominó?",
  "Você seguiu o plano?": "¿Seguiste el plan?",
  "Desvios entre plano e execução": "Desviaciones entre plan y ejecución",
  "Resultado / observação de resultado": "Resultado / observación",
  "Principal aprendizado": "Aprendizaje principal",
  "Gráficos e imagens do que aconteceu": "Gráficos e imágenes de lo ocurrido",
  "Marcar revisão como concluída": "Marcar revisión como completada",
  "Revisão salva.": "Revisión guardada.",
  "Plano salvo.": "Plan guardado.",
  "Sim": "Sí",
  "Parcialmente": "Parcialmente",
  "Não": "No",
  "Não operei": "No operé",
  "Mistura": "Mezcla",
  "Ainda não revisado": "Aún no revisado",
  "Ainda não avaliado": "Aún no evaluado",
  "Não registrado": "No registrado",
  "Nenhum desvio registrado": "No se registraron desviaciones",
  "Cenários não definidos": "Escenarios no definidos",
  "Contexto ainda não descrito.": "Contexto aún no descrito.",
  "ANTES E DEPOIS DO MERCADO": "ANTES Y DESPUÉS DEL MERCADO",
  "Crie hipóteses antes do pregão e preserve uma revisão separada para registrar o que realmente aconteceu.": "Crea hipótesis antes de la sesión y conserva una revisión separada para registrar lo que realmente ocurrió.",
  "+ Novo plano": "+ Nuevo plan",
  "Filtrar por ativo ou data…": "Filtrar por activo o fecha…",
  "plano(s)": "plan(es)",
  "Abrir / editar": "Abrir / editar",
  "Exportar texto": "Exportar texto",
  "Remover este plano?": "¿Eliminar este plan?",
  "Nenhum plano encontrado. Crie um plano para o próximo pregão.": "No se encontró ningún plan. Crea un plan para la próxima sesión.",
  "PREFERÊNCIAS E DADOS": "PREFERENCIAS Y DATOS",
  "Os dados ficam neste navegador. Use backups JSON para transportar ou restaurar todo o conteúdo, inclusive imagens.": "Los datos permanecen en este navegador. Usa copias JSON para trasladar o restaurar todo el contenido, incluidas las imágenes.",
  "Padrões de planejamento": "Valores predeterminados de planificación",
  "Nome do trader": "Nombre del trader",
  "Opcional": "Opcional",
  "Ativos disponíveis": "Activos disponibles",
  "Separe os ativos por vírgula.": "Separa los activos con comas.",
  "Risco máximo padrão": "Riesgo máximo predeterminado",
  "Máx. de trades padrão": "Máx. de trades predeterminado",
  "Tema": "Tema",
  "Escuro": "Oscuro",
  "Claro": "Claro",
  "Idioma": "Idioma",
  "Idioma da interface": "Idioma de la interfaz",
  "Imagens de referência geral": "Imágenes generales de referencia",
  "Backup e recuperação": "Copia de seguridad y recuperación",
  "O JSON é o formato de recuperação completa. Ele inclui regras, setups, planos, versões, revisões, configurações e imagens.": "JSON es el formato de recuperación completa. Incluye reglas, setups, planes, versiones, revisiones, configuración e imágenes.",
  "Exportar backup JSON": "Exportar copia JSON",
  "Importar backup JSON": "Importar copia JSON",
  "Backup importado com sucesso. Backups v1 são migrados automaticamente para o schema atual.": "Copia importada correctamente. Las copias antiguas se migran automáticamente al schema actual.",
  "Backup importado com sucesso. Backups anteriores são migrados automaticamente para o schema atual.": "Copia importada correctamente. Las copias anteriores se migran automáticamente al schema actual.",
  "O JSON é o formato de recuperação completa. O schema v3 inclui biblioteca de setups, histórico de versões congeladas e preferência de idioma.": "JSON es el formato de recuperación completa. El schema v3 incluye la biblioteca de setups, el historial de versiones congeladas y la preferencia de idioma.",
  "Zona de risco": "Zona de riesgo",
  "Apaga todos os dados deste navegador. Exporte um backup antes, se necessário.": "Elimina todos los datos de este navegador. Exporta una copia antes si es necesario.",
  "Apagar todos os dados": "Eliminar todos los datos",
  "Apagar todos os dados locais? Esta ação não pode ser desfeita.": "¿Eliminar todos los datos locales? Esta acción no se puede deshacer.",
  "Salvamento local automático": "Guardado local automático",
  "Dados locais": "Datos locales",
  "Preparando imagens…": "Preparando imágenes…",
  "+ Anexar imagens": "+ Adjuntar imágenes",
  "Remover este setup?": "¿Eliminar este setup?",
  "Falha ao anexar imagem.": "Error al adjuntar la imagen.",
  "Falha ao importar backup.": "Error al importar la copia.",
  "O navegador não conseguiu salvar os dados. Exporte um backup e reduza a quantidade de imagens.": "El navegador no pudo guardar los datos. Exporta una copia y reduce la cantidad de imágenes.",
  "Setup aplicado ao cenário A. Adapte os campos ao contexto específico deste pregão.": "Setup aplicado al escenario A. Adapta los campos al contexto específico de esta sesión.",
  "O setup foi selecionado, mas o plano não possui cenário A para receber o template.": "Se seleccionó el setup, pero el plan no tiene un escenario A para recibir la plantilla.",
  "PNG/JPG/WebP • compactação automática": "PNG/JPG/WebP • compresión automática",
  "Li minhas regras do sistema antes de operar": "Leí las reglas de mi sistema antes de operar",
  "Mapeei eventos macroeconômicos e horários de risco": "Mapeé eventos macroeconómicos y horarios de riesgo",
  "Defini onde não devo operar": "Definí dónde no debo operar",
  "Defini risco máximo e número máximo de trades": "Definí el riesgo máximo y el número máximo de trades",
  "Procurei evidências que contradizem minha tese principal": "Busqué evidencias que contradicen mi tesis principal",
  "Escreva de forma objetiva o que deve ou não deve ser feito.": "Escribe de forma objetiva lo que debe o no debe hacerse.",
  "Que problema, erro recorrente ou princípio técnico esta regra protege?": "¿Qué problema, error recurrente o principio técnico protege esta regla?",
  "Qual ideia operacional este setup representa?": "¿Qué idea operativa representa este setup?",
  "Tendência, volatilidade, localização, horário, correlações…": "Tendencia, volatilidad, ubicación, horario, correlaciones…",
  "Condições objetivas para considerar a entrada.": "Condiciones objetivas para considerar la entrada.",
  "O que precisa acontecer antes da execução?": "¿Qué debe ocurrir antes de la ejecución?",
  "Quando o setup deixa de existir?": "¿Cuándo deja de existir el setup?",
  "Onde e por que o stop deve ficar?": "¿Dónde y por qué debe colocarse el stop?",
  "Parciais, trailing, alvos técnicos…": "Parciales, trailing, objetivos técnicos…",
  "Erros típicos: antecipar, perseguir preço, operar fora do horário…": "Errores típicos: anticipar, perseguir el precio, operar fuera del horario…",
  "Como devo agir para executar este setup corretamente?": "¿Cómo debo actuar para ejecutar correctamente este setup?",
  "Condição objetiva que ativa a hipótese.": "Condición objetiva que activa la hipótesis.",
  "O que precisa confirmar antes da entrada?": "¿Qué debe confirmarse antes de la entrada?",
  "Plano de ação: entrada, espera, direção, técnica.": "Plan de acción: entrada, espera, dirección, técnica.",
  "Critério que invalida a tese.": "Criterio que invalida la tesis.",
  "Ex.: abaixo de 128.450; 1R": "Ej.: por debajo de 128.450; 1R",
  "Ex.: parcial em 1R e alvo em 2R": "Ej.: parcial en 1R y objetivo en 2R",
  "Ex.: não antecipar rompimento; não perseguir preço.": "Ej.: no anticipar ruptura; no perseguir el precio.",
  "Tendência, localização do preço, volatilidade, fluxo, correlações, fechamento anterior…": "Tendencia, ubicación del precio, volatilidad, flujo, correlaciones, cierre anterior…",
  "Máxima/mínima anterior, VWAP, gaps, suportes, resistências, regiões de liquidez…": "Máximo/mínimo anterior, VWAP, gaps, soportes, resistencias, zonas de liquidez…",
  "Ex.: Copom, payroll, abertura NY, leilões, vencimentos…": "Ej.: decisión de banco central, payroll, apertura de NY, subastas, vencimientos…",
  "Ex.: spread anormal, contexto confuso, perda de limite diário…": "Ej.: spread anormal, contexto confuso, límite diario de pérdida alcanzado…",
  "O que merece virar regra, ajuste de setup, checklist ou hipótese futura?": "¿Qué merece convertirse en regla, ajuste de setup, checklist o hipótesis futura?",
  "Descreva a sequência do mercado, mudanças de contexto e os pontos que mais importaram.": "Describe la secuencia del mercado, los cambios de contexto y los puntos que más importaron.",
  "Entradas, saídas, esperas, cancelamentos e decisões que você realmente tomou.": "Entradas, salidas, esperas, cancelaciones y decisiones que realmente tomaste.",
  "O que você fez diferente do planejado? Por quê?": "¿Qué hiciste diferente de lo planificado? ¿Por qué?",
  "Ex.: +1,4R; -R$ 250; não operei": "Ej.: +1,4R; -$250; no operé"
};

function dictionary(language: UiLanguage) {
  return language === "en" ? en : language === "es" ? es : {};
}

function translate(source: string, language: UiLanguage) {
  if (language === "pt-BR") return source;
  const map = dictionary(language);
  if (map[source]) return map[source];

  const scenario = source.match(/^Cenário ([ABC])$/);
  if (scenario) return language === "en" ? `Scenario ${scenario[1]}` : `Escenario ${scenario[1]}`;

  const count = source.match(/^(\d+) plano\(s\)$/);
  if (count) return language === "en" ? `${count[1]} plan(s)` : `${count[1]} plan(es)`;

  return source;
}

type TextMemory = { source: string; rendered: string };
const textMemory = new WeakMap<Node, TextMemory>();
const attributeMemory = new WeakMap<Element, Record<string, TextMemory>>();

function translateTextNode(node: Node, language: UiLanguage) {
  const current = node.nodeValue ?? "";
  if (!current.trim()) return;

  let memory = textMemory.get(node);
  if (!memory || current !== memory.rendered) {
    memory = { source: current, rendered: current };
    textMemory.set(node, memory);
  }

  const leading = memory.source.match(/^\s*/)?.[0] ?? "";
  const trailing = memory.source.match(/\s*$/)?.[0] ?? "";
  const core = memory.source.trim();
  const next = leading + translate(core, language) + trailing;

  if (current !== next) node.nodeValue = next;
  memory.rendered = next;
}

function translateAttribute(element: Element, name: "placeholder" | "title" | "aria-label", language: UiLanguage) {
  const current = element.getAttribute(name);
  if (!current) return;

  let all = attributeMemory.get(element);
  if (!all) {
    all = {};
    attributeMemory.set(element, all);
  }
  let memory = all[name];
  if (!memory || current !== memory.rendered) {
    memory = { source: current, rendered: current };
    all[name] = memory;
  }

  const next = translate(memory.source, language);
  if (current !== next) element.setAttribute(name, next);
  memory.rendered = next;
}

function translateTree(root: Node, language: UiLanguage) {
  if (root.nodeType === Node.TEXT_NODE) {
    translateTextNode(root, language);
    return;
  }

  if (root instanceof Element) {
    translateAttribute(root, "placeholder", language);
    translateAttribute(root, "title", language);
    translateAttribute(root, "aria-label", language);
  }

  root.childNodes.forEach((child) => translateTree(child, language));
}

export function useInterfaceLanguage(language: UiLanguage) {
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = language === "en" ? "Trade Plan" : language === "es" ? "Plan de Trading" : "Plano de Trade";

    const run = () => translateTree(document.body, language);
    run();

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "characterData") {
          translateTextNode(mutation.target, language);
        } else if (mutation.type === "attributes" && mutation.target instanceof Element) {
          const name = mutation.attributeName;
          if (name === "placeholder" || name === "title" || name === "aria-label") {
            translateAttribute(mutation.target, name, language);
          }
        } else {
          mutation.addedNodes.forEach((node) => translateTree(node, language));
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["placeholder", "title", "aria-label"],
    });

    return () => observer.disconnect();
  }, [language]);
}

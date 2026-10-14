# Plano de Trade

**Leia em outros idiomas:** [English](README.en.md) · [Español](README.es.md)


Aplicação local para preparar o trader antes do pregão, registrar cenários condicionais e comparar, depois do mercado, aquilo que foi planejado com aquilo que efetivamente aconteceu.

> Nome de trabalho do projeto. Sugestões de nome definitivo: **Mapa de Trade**, **Plano de Pregão** e **Trade Blueprint**.

## Objetivo

A ferramenta não pretende prever o mercado. Ela organiza o processo decisório do trader antes da abertura, com foco em quatro perguntas:

1. **Qual é minha hipótese e quais cenários considero relevantes para o próximo pregão?**
2. **Que evidências existem contra a minha tese?**
3. **O que farei se o cenário A, B ou C se materializar?**
4. **Depois do pregão, o que o mercado fez, o que eu fiz e quanto respeitei o plano original?**

## Funcionalidades atuais — v0.4

### Sistema de trade

- regras de Entrada, Saída, Risco, Horário, Contexto, Comportamento e outras;
- justificativa para cada regra;
- ativação/desativação;
- imagens explicativas.

### Biblioteca de setups

- cadastro de padrões operacionais reutilizáveis;
- contexto ideal, critérios de entrada, confirmação e invalidação;
- modelo de stop, alvo/gestão e situações a evitar;
- cuidados comportamentais;
- exemplos visuais por imagens;
- aplicação de um setup diretamente ao cenário A de um plano diário, mantendo liberdade para adaptação ao contexto daquele pregão.

### Planos de trade

- plano por ativo e data;
- viés inicial, contexto, níveis, eventos e risco máximo;
- condições para não operar;
- checklist pré-mercado;
- cenários A/B/C com gatilho, confirmação, ação, invalidação, stop, alvos e proibições;
- campo específico de **evidências contra a tese**, para reduzir viés de confirmação;
- plano comportamental no formato “se X acontecer, farei Y”;
- imagens do planejamento.

### Estudos

A seção **Estudos** é mantida separada dos Planos de Trade. Ela serve para análises deliberadas que não precisam estar relacionadas a uma operação futura.

Cada estudo pode registrar:

- título, data do estudo e data de mercado analisada opcional;
- ativo e timeframe/recorte opcionais;
- viés ou hipótese inicial;
- setup de referência opcional;
- pergunta ou objetivo analítico;
- contexto, níveis e eventos/fatores relevantes;
- evidências contra a hipótese;
- cenários A/B/C com a mesma lógica analítica usada nos planos;
- como o trader agiria diante daquele contexto;
- conclusão, aprendizados e próximos estudos;
- imagens e gráficos;
- status **Em andamento** ou **Concluído**;
- exportação em texto.

Estudos possuem armazenamento próprio e não aparecem na agenda de planos operacionais.

### Congelamento e versionamento

O planejamento possui dois estados:

- **Rascunho:** pode ser alterado livremente;
- **Congelado:** o sistema cria uma fotografia imutável do plano antes do pregão.

Se for necessário alterar um plano já congelado, o trader cria uma **nova versão**. A versão anterior permanece preservada. O histórico mostra quando cada versão foi congelada.

Isso evita que a revisão pós-pregão altere retrospectivamente aquilo que o trader realmente pensava antes do mercado abrir.

### Comparador Planejado × Mercado real × Minha execução

Na revisão, a ferramenta separa três camadas:

1. **Planejado** — utiliza a última versão congelada como referência;
2. **Mercado real** — descreve o que efetivamente aconteceu e qual cenário predominou;
3. **Minha execução** — registra o que o trader realmente fez, seus desvios e o resultado.

Se o plano nunca foi congelado, o sistema deixa isso visualmente explícito e usa o rascunho apenas como referência não imutável.

### Idiomas

A interface suporta:

- **Português (Brasil)**;
- **English**;
- **Español**.

O idioma pode ser alterado em **Configurações > Idioma da interface** e a preferência é salva junto com os demais dados e incluída no backup JSON.

A tradução atua apenas na interface. Textos escritos pelo trader — regras, setups, hipóteses, cenários, revisões e observações — não são reescritos ao trocar o idioma.

### Dados e backup

- aplicação local, sem servidor obrigatório;
- armazenamento no `localStorage` no MVP web;
- imagens compactadas antes da persistência;
- backup completo em JSON;
- restauração de backups;
- **migração automática de schemas anteriores para o schema v4**, preservando planos, regras, revisões e imagens criados no MVP anterior;
- tema claro/escuro e lista configurável de ativos.

## Filosofia técnica

O projeto segue princípios já usados no **Trade Journal Tracker**:

- React + TypeScript;
- dados locais e pertencentes ao usuário;
- schema versionado;
- migrações explícitas;
- imagens compactadas;
- backup integral em JSON;
- separação progressiva entre interface, domínio e persistência.

No MVP web os dados são persistidos no navegador. O roadmap prevê uma versão desktop com **Tauri + SQLite**, com maior capacidade para imagens, backups automáticos e operação local em formato instalável.

## Executar localmente

Requisitos: Node.js 20+ e npm.

```bash
npm install
npm run dev
```

Para verificar tipos e gerar a versão de produção:

```bash
npm run typecheck
npm run build
npm run preview
```

## Backup

Em **Configurações > Backup e recuperação**:

- use **Exportar backup JSON** para salvar uma cópia completa;
- use **Importar backup JSON** para restaurar dados compatíveis.

Backups dos schemas v1, v2 e v3 são migrados automaticamente para v4. O sistema não fabrica versões congeladas para planos antigos, pois isso criaria uma falsa evidência de que eles já estavam travados antes do pregão.

## Documentação

- [`docs/PRODUCT-SPEC.md`](docs/PRODUCT-SPEC.md) — especificação funcional;
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — fases concluídas e próximas evoluções.

## Privacidade

O MVP não envia planos, estudos, regras, setups ou imagens para um servidor. Os dados permanecem no armazenamento local do navegador usado para acessar a ferramenta.

# Plano de Trade

Aplicação local para preparar o trader antes do pregão, registrar cenários condicionais e comparar, depois do mercado, aquilo que foi planejado com aquilo que efetivamente aconteceu.

> Nome de trabalho do projeto. Sugestões de nome definitivo: **Mapa de Trade**, **Plano de Pregão** e **Trade Blueprint**.

## Objetivo

A ferramenta não pretende prever o mercado. Ela organiza o processo decisório do trader antes da abertura, com foco em três perguntas:

1. **O que considero provável ou relevante para amanhã?**
2. **O que farei se o cenário A, B ou C se materializar?**
3. **Depois do pregão, o que de fato aconteceu e eu respeitei meu plano?**

## MVP atual

- **Visão geral** com regras ativas, planos, revisões e aderência ao plano.
- **Sistema de trade** para registrar regras de entrada, saída, risco, horário, contexto e comportamento.
- **Planos de trade** por ativo e data.
- **Cenários A/B/C** com gatilho, confirmação, ação, invalidação, stop/risco, alvos e aquilo que deve ser evitado.
- **Plano comportamental “se X, então Y”** para antecipar respostas a impulsos e situações de pressão.
- **Revisão pós-pregão** separada do planejamento original.
- **Imagens em todas as áreas principais**, com compactação automática.
- **Backup completo em JSON**, incluindo imagens, e restauração pelo próprio aplicativo.
- **Exportação textual de um plano individual**.
- Tema claro/escuro e lista configurável de ativos.

## Filosofia técnica

O projeto segue princípios já usados no **Trade Journal Tracker**:

- React + TypeScript;
- dados locais, sem dependência obrigatória de servidor;
- schema versionado para permitir migrações futuras;
- imagens compactadas antes da persistência;
- backup completo em JSON como formato de recuperação;
- separação progressiva entre interface, domínio e persistência.

No MVP web os dados são persistidos no `localStorage` do navegador. O roadmap prevê uma versão desktop com **Tauri + SQLite**, permitindo maior capacidade para imagens, backups automáticos e operação totalmente local em formato instalável.

## Executar localmente

Requisitos: Node.js 20+ e npm.

```bash
npm install
npm run dev
```

Para gerar a versão de produção:

```bash
npm run build
npm run preview
```

## Backup

Em **Configurações > Backup e recuperação**:

- use **Exportar backup JSON** para salvar uma cópia completa;
- use **Importar backup JSON** para restaurar dados compatíveis.

O JSON deve ser tratado como o backup principal. A exportação em texto de um plano é apenas um relatório legível e não substitui o backup.

## Próximos passos

Consulte [`docs/ROADMAP.md`](docs/ROADMAP.md) para o plano de evolução, incluindo biblioteca de setups, score de preparação, comparação planejado × realizado, métricas de aderência, calendário, desktop Tauri/SQLite e integração opcional com o Trade Journal Tracker.

## Privacidade

O MVP não envia planos, regras ou imagens para um servidor. Os dados permanecem no armazenamento local do navegador usado para acessar a ferramenta.

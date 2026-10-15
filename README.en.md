# Trade Plan

**Read this in other languages:** [Português](README.md) · [Español](README.es.md)

Local-first application designed to help traders prepare before the trading session, define conditional scenarios, preserve what was actually planned, and compare it afterward with the real market and their own execution.

> Working project name. Suggested final names: **Mapa de Trade**, **Plano de Pregão**, and **Trade Blueprint**.

## Purpose

The tool is not designed to predict the market. It organizes the trader's decision-making process before the open around four questions:

1. **What is my thesis and which scenarios matter for the next session?**
2. **What evidence exists against my thesis?**
3. **What will I do if scenario A, B, or C materializes?**
4. **After the session, what did the market do, what did I do, and how closely did I follow the original plan?**

## Current features — v0.5

### Trading system

- rules for Entry, Exit, Risk, Time, Context, Behavior, and other categories;
- rationale for each rule;
- enable/disable status;
- explanatory images.

### Setup library

- reusable trading-pattern library;
- ideal market context, entry criteria, confirmations, and invalidation;
- stop model, target/management model, and situations to avoid;
- behavioral safeguards;
- visual examples;
- apply a setup directly to scenario A of a daily plan while keeping the plan editable for that specific session.

### Trade plans

- one plan per asset and trading date;
- initial bias, context, levels, events, and maximum risk;
- no-trade conditions;
- pre-market checklist;
- A/B/C scenarios with trigger, confirmation, action, invalidation, stop, targets, and prohibited behavior;
- a dedicated **evidence against the thesis** field to reduce confirmation bias;
- behavioral plan in the form “if X happens, I will do Y”;
- planning images.

### Studies

The **Studies** section is kept separate from Trade Plans. It is designed for deliberate analytical exercises that do not need to be connected to a future trade.

Each study can store:

- title, study date, and optional analyzed market date;
- optional asset and timeframe/sample;
- initial bias or hypothesis;
- optional reference setup;
- analytical question or objective;
- context, levels, and relevant events/factors;
- evidence against the hypothesis;
- A/B/C scenarios using the same analytical logic as trade plans;
- how the trader would act in that context;
- conclusion, lessons, and next studies;
- charts and images;
- **In progress** or **Completed** status;
- text export.

Studies have their own storage collection and do not appear in the operational plan agenda.

### Freezing and versioning

A plan has two states:

- **Draft:** freely editable;
- **Frozen:** the system creates an immutable snapshot of the plan before the trading session.

If a frozen plan must be changed, the trader creates a **new version**. Previous versions remain preserved and timestamped.

This prevents the post-session review from rewriting what the trader actually thought before execution.

### Planned × Actual Market × My Execution

The review separates three layers:

1. **Planned** — based on the latest frozen version;
2. **Actual market** — records what really happened and which scenario prevailed;
3. **My execution** — records what the trader actually did, deviations, and result.

If a plan was never frozen, the application makes that explicit and uses the current draft only as a non-immutable reference.

### Languages

The interface supports:

- **Português (Brasil)**;
- **English**;
- **Español**.

Change the language in **Settings > Interface language**. The preference is saved locally and included in JSON backups.

Localization affects only the interface. User-authored content — rules, setups, hypotheses, scenarios, reviews, and notes — is never destructively translated when the interface language changes.

### Desktop application

- Tauri 2;
- Windows NSIS installer;
- single-instance behavior;
- in-app update panel under Settings;
- public GitHub Releases as the update source;
- signed updates installed over the existing version without manual uninstall.

See [`docs/DESKTOP.md`](docs/DESKTOP.md) for build, signing, and release instructions.

### Data and backup

- local-first application with no mandatory server;
- `localStorage` persistence in the web MVP;
- images compressed before persistence;
- complete JSON backup;
- backup restoration;
- automatic migration from schema v1, v2, and v3 to **schema v4**;
- light/dark theme, configurable asset list, and persistent language preference.

## Technical philosophy

The project follows principles already used in the **Trade Journal Tracker**:

- React + TypeScript;
- user-owned local data;
- versioned schema;
- explicit migrations;
- compressed images;
- complete JSON backup;
- progressive separation between UI, domain logic, and persistence.

The web MVP stores data in the browser. The desktop application now has a **Tauri 2** foundation and NSIS installer. The next architectural step is migrating desktop persistence to **SQLite** with automatic backups and stronger durability.

## Run locally

Requirements: Node.js 20+ and npm.

```bash
npm install
npm run dev
```

To type-check and build the production version:

```bash
npm run typecheck
npm run build
npm run preview
```

## Backup

Under **Settings > Backup and recovery**:

- use **Export JSON backup** to save a complete copy;
- use **Import JSON backup** to restore compatible data.

Schema v1, v2, and v3 backups are migrated automatically to v4. The system does not fabricate frozen versions for old plans because that would create false evidence that they had already been locked before the session.

## Documentation

- [`docs/PRODUCT-SPEC.md`](docs/PRODUCT-SPEC.md) — functional specification;
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — completed phases and planned evolution.

## Privacy

The MVP does not send plans, studies, rules, setups, images, or reviews to a server. Data remains in the browser's local storage unless the user explicitly exports it.

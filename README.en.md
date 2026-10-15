# Trade Plan

**Read this in other languages:** [Português](README.md) · [Español](README.es.md)

Local application designed to help traders prepare before the trading session, organize analytical studies, and compare what was planned with what actually happened.

## Purpose

The tool is not designed to predict the market. It organizes the trader's decision-making process around four questions:

1. **What is my thesis and which scenarios matter for the next session?**
2. **What evidence exists against my thesis?**
3. **What will I do if scenario A, B, or C materializes?**
4. **After the session, what did the market do, what did I do, and how closely did I follow the original plan?**

## Current features — v0.6

### Trading system

- Entry, Exit, Risk, Time, Context, and Behavior rules;
- rationale for each rule;
- enable/disable status;
- explanatory images.

### Setup library

- reusable trading patterns;
- ideal context, entry criteria, confirmation, and invalidation;
- stop and target/management models;
- situations to avoid and behavioral safeguards;
- images;
- apply a setup to scenario A of a plan.

### Trade plans

- plan by asset and date;
- bias and **declared thesis conviction**;
- context, levels, events, and maximum risk;
- no-trade conditions;
- **evidence against the thesis**;
- **“what would have to happen for me to change my mind?”**;
- A/B/C scenarios;
- behavior plan;
- images;
- freezing and version history;
- post-session review;
- **Planned × Actual Market × My Execution** comparison.

### Preparation quality

Before freezing a plan, the application shows a **preparation completeness score** and identifies important missing fields.

The score:

- measures process completeness only;
- **does not predict the market**;
- **is not an entry signal**;
- warns about critical gaps without necessarily blocking the trader.

The pre-market checklist now tracks **completed/not completed** state.

You can also:

- save a plan as a **template**;
- create plans from templates;
- duplicate a previous plan **without copying its review**.

### Studies

The **Studies** section is separate from Trade Plans and supports analytical exercises that do not need to be tied to a future trade.

### Desktop application

The project has a **Tauri 2** foundation for Windows distribution, including:

- NSIS installer;
- single-instance behavior;
- in-app update panel;
- signed-update infrastructure using GitHub Releases;
- updates installed over the existing version without manual uninstall.

Desktop build and release details: [`docs/DESKTOP.md`](docs/DESKTOP.md).

### Data and backup

- local storage;
- compressed images;
- complete JSON backup;
- backup restoration;
- automatic migration of older schemas to **schema v5**;
- light/dark theme;
- Portuguese (Brazil), English, and Spanish interface.

## Installation and use on Windows

There are two ways to use the project.

### Option 1 — Install the Windows application

When a Windows installer is available under **Releases**:

1. open the repository on GitHub;
2. open **Releases**;
3. select the latest version;
4. download the Windows setup file, typically named like:
   ```text
   Plano-de-Trade-0.x.x-Windows-x64-setup.exe
   ```
5. double-click the downloaded file;
6. follow the installer;
7. open **Plano de Trade** from the Start Menu.

Official builds with the updater enabled can check for new versions under **Settings > Desktop app and updates**.

> If there is no installer Release yet, use the option below.

### Option 2 — Run from source

#### 1. Install Node.js

Install a current **Node.js LTS** version.

#### 2. Download the project

On GitHub:

1. click **Code**;
2. click **Download ZIP**;
3. extract the ZIP;
4. open the extracted folder.

#### 3. Open Command Prompt in that folder

In Windows Explorer:

1. click the folder's address bar;
2. type:
   ```text
   cmd
   ```
3. press **Enter**.

Command Prompt will open directly in the correct folder.

#### 4. Install dependencies

Run:

```bash
npm install
```

Wait until it finishes. You normally need to do this again only after downloading a newer project version or when dependencies change.

#### 5. Start the application

Run:

```bash
npm run dev
```

When you see something similar to:

```text
Local: http://localhost:5173/
```

open that address in your browser.

Keep Command Prompt open while the local server is running. To stop it, return to the terminal and press **Ctrl + C**.

### Optional checks

```bash
npm run typecheck
npm run build
```

Building the desktop installer requires additional development tools. See [`docs/DESKTOP.md`](docs/DESKTOP.md) only if you intend to develop or package the desktop application.

## Backup

Under **Settings > Backup and recovery**:

- use **Export JSON backup** to save a complete copy;
- use **Import JSON backup** to restore compatible data.

Older backups are migrated automatically to the current schema.

## Documentation

- [`docs/PRODUCT-SPEC.md`](docs/PRODUCT-SPEC.md)
- [`docs/ROADMAP.md`](docs/ROADMAP.md)
- [`docs/DESKTOP.md`](docs/DESKTOP.md)

# CodeOrbit — Architecture & System Design

**In one line:** a free study tracker for developers that keeps everything in your own browser  
**Organization:** LET'S COOK — THE FOUNDRY  
**Version:** 0.2.0 (see [CHANGELOG](../CHANGELOG.md))  

---

## 1. Architectural Philosophy

CodeOrbit is a **frontend-only Single Page Application (SPA) with no build step** that keeps all data in the user's own browser. Its only runtime dependencies are two pinned CDN libraries: Chart.js (charts) and Lucide (icons). After the first visit it also works offline (`sw.js`, D-024).

### Core Tenets:
1. **Zero External Backend / Zero API Costs:** All data is held strictly in browser `localStorage`.
2. **Vanilla JavaScript ES6+ Modules:** No React, Next.js, Vue, Angular, or TypeScript builds. The codebase executes natively in modern browsers with instant load times.
3. **One way data changes:** every save goes through `storage.js`, which fires one `codeorbit:data-changed` event; `app.js` has the only listener (it checks badges, then redraws the page on screen). See [FLOW.md](FLOW.md).
4. **Beginner-Friendly Maintainability:** one file per page, plain words on screen (D-020, D-022), stored values that never change.

---

## 2. Directory Structure

```text
codeorbit/
├── index.html                  # Semantic entry point with all views and accessible dialogs
├── sw.js                       # Offline support, network first (D-024)
├── manifest.webmanifest        # App name and icons for installing
├── README.md                   # Project overview, setup, and philosophy
├── CHANGELOG.md                # What changed in each version
├── CONTRIBUTING.md, CODE_OF_CONDUCT.md, SECURITY.md
├── LICENSE                     # MIT License
├── package.json                # Dev tools only (ESLint, Prettier); the app itself needs no install
├── eslint.config.js, .prettierrc.json, .prettierignore
├── .gitignore, .git-blame-ignore-revs
├── assets/
│   ├── css/
│   │   ├── style.css           # Fonts, colour tokens (one dark look, D-025), top bar, page layout
│   │   ├── components.css      # Buttons, cards, inputs, modals, toasts, dropdowns
│   │   ├── dashboard.css       # Home page, shared number strip, progress score
│   │   ├── orbital.css         # The orbit on Home (one planet per skill)
│   │   └── responsive.css      # Phone layout (navigation row, stacked filters)
│   ├── js/
│   │   ├── app.js              # Start-up steps, the one data-changed listener, shortcuts, starfield, offline
│   │   ├── storage.js          # The only file that reads/writes localStorage (no upgrade step yet, issue #17)
│   │   ├── utils.js            # escapeHTML, safeUrl, labels for stored values, dates, days in a row, score, badge sound
│   │   ├── navigation.js       # Hash-based routing (#dashboard, #skills, etc.)
│   │   ├── components.js       # Dialogs, toasts, "Are you sure?", search (Ctrl+K)
│   │   ├── icons.js            # Small inline line icons (replaces emoji)
│   │   ├── recap.js            # "Your week in review" pop-up and next week's goal
│   │   ├── dashboard.js        # Home: week hours, orbit, last 7 days, coming up, +30 min, backup reminder, first visit
│   │   ├── skills.js           # Skills page: add/edit/delete, filters, search, sorting
│   │   ├── progress.js         # Study sessions page (route #progress) and today's goal ring
│   │   ├── projects.js         # Projects page and tool tags
│   │   ├── goals.js            # Goals page, due dates and late goals
│   │   ├── achievements.js     # Badge rules and the Badges page (route #achievements)
│   │   ├── analytics.js        # Progress page (route #analytics): score, badges count, charts, "What we noticed"
│   │   ├── settings.js         # Profile, profile picture, study goals, sounds, backup/restore, sample data, install
│   │   └── charts.js           # Chart.js setup (black, white, grey, crimson) & lifecycle
│   ├── fonts/                  # Inter + JetBrains Mono (SIL OFL), served locally (D-021)
│   └── images/
│       ├── letscook-mark-dark.png  # Let's Cook mark used in the app
│       └── icon-*.png, apple-touch-icon.png, favicon-32.png  # App icons (manifest, browser tab)
├── tests/
│   ├── *.test.js               # Unit tests (node:test): utils, storage, badges, navigation, offline list
│   └── helpers/                # Browser stand-ins for Node, and freezeTime() for date tests
├── scripts/
│   └── test.mjs                # Runs the tests in 4 timezones (npm test)
├── docs/
│   ├── ARCHITECTURE.md         # This document
│   ├── DECISIONS.md            # Decision log with reasons and trade-offs
│   ├── FLOW.md                 # Code execution flow between files
│   ├── MAINTAINER_SECURITY.md  # Administrative security checklist
│   └── screenshots/            # How to take README screenshots (issue #12)
└── .github/
    ├── workflows/ci.yml        # Lint & format + unit tests; deploys main to GitHub Pages only if both pass
    ├── ISSUE_TEMPLATE/         # Bug report and feature request forms
    ├── PULL_REQUEST_TEMPLATE.md
    ├── dependabot.yml          # Update PRs for GitHub Actions and the npm dev tools
    └── readme/                 # README graphics; src/build.py makes them
```

**Deployment:** GitHub Pages, owned by the LetsCook-Organization org, deployed by `.github/workflows/ci.yml` on every push to `main`, **only after ESLint, Prettier and the unit tests pass**. See `DECISIONS.md` D-012, D-014 and D-015.

---

## 3. Data Schema (`localStorage`)

All persistent data is one JSON object under the key `codeorbit_universe_v1` (the name is older than the current wording and never changes; old backups must keep loading). An unreadable value is copied to `codeorbit_universe_v1_corrupt_backup` before starting empty. The example below is the sample data, shortened, with every possible settings field shown.

```json
{
  "version": 1,
  "profile": {
    "name": "Alex Rivera",
    "title": "Full-Stack Explorer & AI Builder",
    "bio": "Charting a course across modern web frameworks...",
    "avatar": "astronaut",
    "github": "alexrivera-orbit",
    "joinedDate": "2026-01-15"
  },
  "settings": {
    "dailyTargetHours": 2,
    "weeklyTargetHours": 12,
    "soundEnabled": true,
    "sampleData": true,
    "lastBackupAt": "2026-11-01T18:20:00.000Z",
    "backupSnoozeUntil": "",
    "recapSeenFor": "2026-11-08"
  },
  "skills": [
    {
      "id": "sk_abc123",
      "name": "TypeScript",
      "category": "Programming",
      "proficiency": "Advanced",
      "status": "Learning",
      "progress": 85,
      "targetDate": "2026-12-15",
      "description": "Generics and compiler configuration",
      "createdAt": "2026-09-01T10:00:00.000Z",
      "updatedAt": "2026-11-05T14:30:00.000Z"
    }
  ],
  "activities": [
    {
      "id": "act_def456",
      "title": "Built Custom Embedding Pipeline",
      "skill": "Python & PyTorch",
      "duration": 90,
      "date": "2026-11-07",
      "type": "Coding",
      "notes": "Implemented cosine similarity matrix",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "projects": [
    {
      "id": "proj_ghi789",
      "name": "OrbitFlow CLI",
      "description": "Terminal utility for tracking developer focus sprints",
      "technologies": ["TypeScript", "Node.js"],
      "status": "In Progress",
      "progress": 75,
      "githubUrl": "https://github.com/...",
      "liveDemoUrl": "https://...",
      "startDate": "2026-10-01",
      "targetDate": "2026-11-20"
    }
  ],
  "goals": [
    {
      "id": "goal_jkl012",
      "title": "Ship v1.0 of OrbitFlow CLI to npm",
      "category": "Web Development",
      "deadline": "2026-11-20",
      "priority": "Critical",
      "progress": 80,
      "status": "Active"
    }
  ],
  "achievements": [
    {
      "id": "first_skill",
      "unlockedAt": "2026-09-01T10:00:00.000Z"
    }
  ]
}
```

---

**Settings, field by field:**

| Field | Meaning |
| :--- | :--- |
| `dailyTargetHours`, `weeklyTargetHours` | The study goals (defaults 2 and 10: `DEFAULT_DAILY_HOURS`, `DEFAULT_WEEKLY_HOURS` in `utils.js`) |
| `soundEnabled` | Settings → Sounds: the chime when you earn a badge |
| `sampleData` | Set by "Load sample data"; removed as soon as you add or change a skill, session, project or goal. While set, there is no backup reminder (D-026) |
| `lastBackupAt`, `backupSnoozeUntil` | When you last downloaded or restored a backup, and "Not now" on the reminder. Kept when the data is replaced (they describe this device) |
| `recapSeenFor` | The last day (a Sunday) of the week whose "Your week in review" you opened, so Home stops offering it |

**Stored values and the words people see** (D-022): skill `status` is `Not Started` / `Learning` / `Practicing` / `Completed` (shown as Not started / Learning / Practising / Finished); project `status` is `Planning` / `In Progress` / `On Hold` / `Completed` (Planning / In progress / Paused / Finished); goal `status` is `Active` / `Completed` (In progress / Finished); session `type` `Project Development` shows as "Project work"; session `skill` `General Exploration` shows as "General". Badges are stored as `achievements`; their ids (`first_mission`, `orbit_streak`, …) never change.

---

## 4. Key Calculation Formulas

### A. Days in a row
The current run counts consecutive days with study time up to today, or up to yesterday when nothing has been added yet today (Home then says the run is at risk). The longest run is found by walking all study days in order. All days are **local** calendar days (D-007).

### B. Progress score (0–100)
The progress score (shown on the Progress page) uses four explainable components:
$$\text{Score} = \text{Studying often} (30) + \text{Weekly goal} (30) + \text{Projects} (20) + \text{Skills} (20)$$

- **Studying often:** $(\text{days with study time in the last 7} / 7) \times 30$
- **Weekly goal:** $\min(30, (\text{hours in the last 7 days} / \text{weekly goal}) \times 30)$
- **Projects:** $(\text{average progress of projects} / 100) \times 20$
- **Skills:** $(\text{average progress of skills} / 100) \times 20$

Each part is rounded. If the user has no projects (or no skills), that part counts as a neutral 10/20, **but only after at least one study session has been added**. With nothing saved, the score is 0 (see `DECISIONS.md` D-015). Code: `calculateProgressScore` in `utils.js`; the breakdown keys stay `consistency`, `learningHours`, `projects`, `skills`.

Levels: 0–29 Just beginning, 30–49 Getting started, 50–69 Good, 70–84 Very good, 85–100 Excellent.

### C. Backup reminder and week in review
- **Backup reminder** (`backupReminder` in `utils.js`): shown on Home when there are at least 3 study sessions, the data is not sample data, there is no backup from the last 30 days, and "Not now" (7 days) is not active.
- **Week in review** (`weeklyRecap` in `utils.js`, `recap.js`): the Monday–Sunday week that ended on the most recent Sunday, compared with the week before. Offered on Home on Sundays and Mondays until opened; always available on the Progress page.

---

## 5. Security Architecture
- All saved text rendered into the page passes through `escapeHTML()`, ids in attributes included. Helpers whose output goes into `innerHTML` (e.g. `formatDate`) never return their raw input. The Home orbit is built with DOM APIs and `textContent`, so it never parses saved text as HTML.
- Links from saved data (a project's GitHub and live site links) pass through `safeUrl()`: only `http://` and `https://` become links, so a `javascript:` link from a backup file cannot run. They open with `rel="noopener noreferrer"`.
- Restoring a backup checks it first: the core lists must exist, numbers are clamped, and **malformed dates are dropped** (sessions and badges without a valid date are removed). See `DECISIONS.md` D-018.
- `tests/` includes security regression tests for all of the above.

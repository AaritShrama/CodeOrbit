# CodeOrbit — Architecture & System Design

**Tagline:** Your Universe of Developer Growth  
**Organization:** LET'S COOK — THE FOUNDRY  
**Version:** 0.1.0 (see [CHANGELOG](../CHANGELOG.md))  

---

## 1. Architectural Philosophy

CodeOrbit is a **frontend-only Single Page Application (SPA) with no build step** that keeps all data in the developer's own browser. Its only runtime dependencies are two pinned CDN libraries: Chart.js (charts) and Lucide (icons).

### Core Tenets:
1. **Zero External Backend / Zero API Costs:** All data is held strictly in browser `localStorage`.
2. **Vanilla JavaScript ES6+ Modules:** No React, Next.js, Vue, Angular, or TypeScript builds. The codebase executes natively in modern browsers with instant load times.
3. **Deterministic State Synchronization:** All CRUD operations flow through a centralized `storage.js` singleton that broadcasts a global `codeorbit:data-changed` CustomEvent.
4. **Beginner-Friendly Maintainability:** Modular, readable files cleanly separated by feature boundaries.

---

## 2. Directory Structure

```text
codeorbit/
├── index.html                  # Semantic entry point with all views and accessible dialogs
├── README.md                   # Project overview, setup, and philosophy
├── LICENSE                     # MIT License
├── .gitignore                  # Clean repository ignores
├── assets/
│   ├── css/
│   │   ├── style.css           # Fonts, colour tokens (dark + light), top bar, page layout
│   │   ├── components.css      # Buttons, cards, inputs, modals, toasts, dropdowns
│   │   ├── dashboard.css       # Home page, shared number strip, progress score
│   │   ├── orbital.css         # The orbit on Home (one planet per skill)
│   │   └── responsive.css      # Phone layout (navigation row, stacked filters)
│   ├── js/
│   │   ├── app.js              # Bootstrap orchestrator, event bus & canvas starfield
│   │   ├── storage.js          # Centralized LocalStorage manager (no migrations yet, see issue #17)
│   │   ├── utils.js            # Sanitization (XSS safe), streaks, score math, web audio
│   │   ├── navigation.js       # Hash-based routing (#dashboard, #skills, etc.)
│   │   ├── components.js       # Modal controller, Toast engine, Command Palette (Ctrl+K)
│   │   ├── icons.js            # Small inline line icons (replaces emoji)
│   │   ├── dashboard.js        # Home: week hours, orbit, last 7 days, coming up, first visit
│   │   ├── skills.js           # Skills page: add/edit/delete, filters, search, sorting
│   │   ├── progress.js         # Study sessions page and daily goal ring
│   │   ├── projects.js         # Projects page and tool tags
│   │   ├── goals.js            # Goals page, due dates and late goals
│   │   ├── achievements.js     # Badge rules and the Badges page
│   │   ├── analytics.js        # Progress page: score, badges count, charts, observations
│   │   ├── settings.js         # Profile editor, avatars, theme toggle, JSON backup/restore
│   │   └── charts.js           # Chart.js setup (black, white, grey, crimson) & lifecycle
│   ├── fonts/                  # Inter + JetBrains Mono (SIL OFL), served locally (D-021)
│   └── images/
│       ├── letscook-mark-dark.png / -light.png  # Let's Cook mark used in the app (dark / light theme)
│       ├── logo.svg            # Older CodeOrbit planet logo (no longer shown in the app)
│       └── favicon.svg         # High-resolution cosmic browser tab favicon
├── docs/
│   ├── ARCHITECTURE.md         # This architectural specification
│   ├── DECISIONS.md            # Decision log with reasons and trade-offs
│   ├── FLOW.md                 # Code execution flow between files
│   └── MAINTAINER_SECURITY.md  # Administrative security checklist
└── .github/
    └── workflows/
        └── ci.yml              # Lint + format checks; deploys main to GitHub Pages
```

**Deployment:** GitHub Pages, owned by the LetsCook-Organization org, deployed by `.github/workflows/ci.yml` on every push to `main`, **only after ESLint, Prettier and the unit tests pass**. See `DECISIONS.md` D-012, D-014 and D-015.

---

## 3. Data Schema (`localStorage`)

All persistent data is stored under the atomic key: `codeorbit_universe_v1`.

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
    "theme": "dark",
    "dailyTargetHours": 2,
    "weeklyTargetHours": 12,
    "soundEnabled": true,
    "reducedMotion": false
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

## 4. Key Calculation Formulas

### A. Orbit Streak Algorithm
A streak requires activities on consecutive days leading up to today (or yesterday if no session has been recorded yet today). The longest streak is preserved historically by traversing sorted dates chronologically.

### B. Progress score (0–100)
The progress score (shown on the Progress page) uses four explainable components:
$$\text{Score} = \text{Consistency} (30) + \text{Hours Target} (30) + \text{Projects} (20) + \text{Skill Growth} (20)$$

- **Consistency:** $(\text{Active Days in Last 7 Days} / 7) \times 30$
- **Hours Target:** $\min(30, (\text{Hours Logged this Week} / \text{Weekly Target}) \times 30)$
- **Projects:** $(\text{Average Progress of Projects} / 100) \times 20$
- **Skill Growth:** $(\text{Average Progress of Skills} / 100) \times 20$

If the user has no projects (or no skills), that part counts as a neutral 10/20, **but only after at least one session has been logged**. An empty universe scores 0 (see `DECISIONS.md` D-015).

---

## 5. Security Architecture
- All dynamic data rendered into the DOM passes through `escapeHTML()` to neutralize cross-site scripting (XSS). Helpers whose output goes into `innerHTML` (e.g. `formatDate`) never return their raw input.
- JSON imports are validated before committing to storage: required lists must exist, numbers are clamped, and **malformed dates are dropped** (sessions and achievements without a valid date are removed). See `DECISIONS.md` D-018.
- `tests/` includes security regression tests for both of the above.
- External links (`GitHub`, `Live Demo`) enforce safe `http/https` protocols and carry `rel="noopener noreferrer"`.

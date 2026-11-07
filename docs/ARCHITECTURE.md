# CodeOrbit — Architecture & System Design

**Tagline:** Your Universe of Developer Growth  
**Organization:** LET'S COOK — THE FOUNDRY  
**Version:** 1.0.0  

---

## 1. Architectural Philosophy

CodeOrbit is engineered as a **zero-dependency, frontend-only Single Page Application (SPA)** that puts complete data sovereignty into the developer's hands.

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
│   │   ├── style.css           # Design tokens, variables, base layout & reset
│   │   ├── components.css      # Buttons, cards, inputs, modals, toasts, dropdowns
│   │   ├── dashboard.css       # Cinematic hero, KPI cards, velocity score ring
│   │   ├── orbital.css         # Dynamic SVG/CSS multi-ring planetary visualization
│   │   └── responsive.css      # Desktop (1440px), Laptop (1024px), Tablet (768px), Mobile (375px)
│   ├── js/
│   │   ├── app.js              # Bootstrap orchestrator, event bus & canvas starfield
│   │   ├── storage.js          # Centralized LocalStorage manager & migration engine
│   │   ├── utils.js            # Sanitization (XSS safe), streaks, score math, web audio
│   │   ├── navigation.js       # Hash-based routing (#dashboard, #skills, etc.)
│   │   ├── components.js       # Modal controller, Toast engine, Command Palette (Ctrl+K)
│   │   ├── dashboard.js        # Command Center logic & planetary orbit engine
│   │   ├── skills.js           # Skill Universe CRUD, filters, search & sorting
│   │   ├── progress.js         # Mission Logs time tracking & daily goal ring
│   │   ├── projects.js         # Space Missions project manager & tech stack tags
│   │   ├── goals.js            # Milestones target horizons & overdue calculations
│   │   ├── achievements.js     # Real-time condition evaluation & celebratory chimes
│   │   ├── analytics.js        # Deep velocity metrics & automated habit insights
│   │   ├── settings.js         # Profile editor, avatars, theme toggle, JSON backup/restore
│   │   └── charts.js           # Chart.js cosmic gradient configurations & lifecycle
│   └── images/
│       ├── logo.svg            # Central planet with orbital ring branding
│       └── favicon.svg         # High-resolution cosmic browser tab favicon
├── docs/
│   ├── ARCHITECTURE.md         # This architectural specification
│   └── MAINTAINER_SECURITY.md  # Administrative security checklist
└── .github/
    └── workflows/
        └── deploy.yml          # GitHub Pages automated deployment workflow
```

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

### B. Developer Velocity Index (0–100)
The velocity score uses four explainable components:
$$\text{Score} = \text{Consistency} (30) + \text{Hours Target} (30) + \text{Missions Progress} (20) + \text{Skill Growth} (20)$$

- **Consistency:** $(\text{Active Days in Last 7 Days} / 7) \times 30$
- **Hours Target:** $\min(30, (\text{Hours Logged this Week} / \text{Weekly Target}) \times 30)$
- **Missions Progress:** $(\text{Average Progress of Space Missions} / 100) \times 20$
- **Skill Growth:** $(\text{Average Progress of Skills} / 100) \times 20$

---

## 5. Security Architecture
- All dynamic data rendered into the DOM passes through `escapeHTML()` to neutralize cross-site scripting (XSS).
- JSON imports are validated against the schema before committing to storage.
- External links (`GitHub`, `Live Demo`) enforce safe `http/https` protocols and carry `rel="noopener noreferrer"`.

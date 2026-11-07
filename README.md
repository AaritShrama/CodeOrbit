# CodeOrbit — Your Universe of Developer Growth

<p align="center">
  <img src="assets/images/logo.svg" alt="CodeOrbit Logo" width="128" height="128">
</p>

<p align="center">
  <strong>Your Universe of Developer Growth.</strong><br>
  A personal developer productivity and learning management platform that transforms your technical journey into a structured, visually stunning, cosmic experience.
</p>

<p align="center">
  <a href="#-project-overview">Overview</a> •
  <a href="#-core-features">Features</a> •
  <a href="#-visual-interface--layout">Visual Tour</a> •
  <a href="#-technology-stack">Tech Stack</a> •
  <a href="#-system-architecture">Architecture</a> •
  <a href="#-folder-structure">Folder Structure</a> •
  <a href="#-quick-start--local-development">Quick Start</a> •
  <a href="#-roadmap">Roadmap</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-organization">Organization</a> •
  <a href="#-license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Organization-LET'S_COOK_—_THE_FOUNDRY-7C3AED?style=for-the-badge" alt="LET'S COOK — THE FOUNDRY">
  <img src="https://img.shields.io/badge/Stack-Vanilla_JS_ES6+-38BDF8?style=for-the-badge" alt="Vanilla JS">
  <img src="https://img.shields.io/badge/Storage-100%25_LocalStorage-22C55E?style=for-the-badge" alt="LocalStorage">
  <img src="https://img.shields.io/badge/License-MIT-F97316?style=for-the-badge" alt="MIT License">
  <img src="https://img.shields.io/badge/Zero-Build_Steps-6366F1?style=for-the-badge" alt="Zero Build Steps">
</p>

---

## 🌌 Project Overview

**CodeOrbit** is an open-source personal developer productivity platform designed and maintained under **LET'S COOK — THE FOUNDRY**. It bridges the gap between scattered learning bookmarks, unmeasured coding sprints, and unstructured project ideas by organizing a developer's entire growth trajectory into a personal, interactive **universe**.

Students and developers frequently face common growth friction:
- *What should I study next?*
- *How many hours did I code this week?*
- *Are my personal projects making verifiable progress?*
- *Am I staying consistent over time?*

CodeOrbit answers these questions through a space-inspired Command Center equipped with **real-time telemetry**, **planetary orbital visualizers**, **deep-focus mission logs**, **space mission portfolio trackers**, **milestone target horizons**, and **multi-dimensional universe analytics**.

### Key Highlights
- **100% Offline & Private:** All data resides exclusively in your browser's `localStorage`. No mandatory user accounts, cloud databases, external trackers, or telemetry collection.
- **Zero Build Tooling:** Native HTML5, modern CSS3, and ES6+ modules (`import`/`export`). No `npm install`, Webpack, Vite, Babel, or complex runtime toolchains required to get started.
- **Cinematic Celestial Aesthetics:** Deep cosmic navy themes, subtle animated starfields, glassmorphic cards, luminous orbital rings, and an accessible high-contrast Orbital Light theme.
- **Deterministic Velocity Engine:** Real-time productivity scoring calculated dynamically from weekly consistency, learning hours vs. target, project velocity, and skill advancements.
- **Full Data Sovereignty:** One-click JSON backup, restoration, pre-loaded demo exploration datasets, and safe factory wipes.

---

## 🪐 Visual Interface & Layout

CodeOrbit combines the visual polish of modern SaaS developer tools with the captivating immersion of a cosmic operating system.

### Command Center Topology

```text
+----------------------------------------------------------------------------------------------------+
|  [LOGO] CodeOrbit         [ Search Entire Universe (Ctrl+K) ]      [Day 5 Streak 🔥]  [Theme] [Avatar]|
+----------------------------------------------------------------------------------------------------+
| SIDEBAR      | HERO COMMAND CENTER                                                                 |
|              | "Welcome to Your Developer Universe, Pilot"                                        |
| 🛸 Command   | [ Orbit Streak: 5 Days ] [ Velocity: 84/100 ] [ Target: 2.5/3.0h Today ]           |
| 🪐 Skills    +-------------------------------------------------------------------------------------+
| 📝 Logs      | TELEMETRY KPI CARDS                                                                 |
| 🛰 Projects  | [ Skills: 12 Active ] [ Learning: 42.5 hrs ] [ Projects: 4 Flights ] [ Streak: 5d ]  |
| 🎯 Goals     +--------------------------------------------------+----------------------------------+
| ⭐ Badges    | ORBITAL SKILL UNIVERSE (Canvas / SVG)            | VELOCITY TRAJECTORY & METRICS    |
| 📊 Analytics |       (Core: React)                              | Weekly Learning Distribution     |
| ⚙️ Settings  |      /       |       \                           | [Mon: 2h] [Tue: 3.5h] [Wed: 1h]  |
|              |   (Node.js)  (Python)  (TypeScript)              | Developer Velocity Index: 84/100 |
|              | [Pause / Resume]  [Constellation Grid View]      | [View Calculation Breakdown]     |
|              +--------------------------------------------------+----------------------------------+
|              | ACTIVE FLIGHTPATHS (Projects)                    | UPCOMING HORIZONS (Milestones)   |
|              | • CloudSync API [=======--- 70%] [In Progress]   | • Complete Docker Cert [3 Days]  |
|              | • Starlink Engine [===-------- 30%] [Planning]   | • Launch Portfolio v2  [Overdue] |
+----------------------------------------------------------------------------------------------------+
```

---

## 🚀 Core Features

CodeOrbit features 9 deeply integrated modules designed to support every phase of your software journey:

### 1. 🪐 Command Center (Dashboard)
- **Celestial Hero Section:** Live greeting, personalized pilot callsign, active streak counter, and rapid 1-click modal launchers.
- **Dynamic Telemetry Cards:** 4 real-time KPI indicators displaying active vs. mastered skills, total hours logged, active space missions, and unbroken streak days.
- **Developer Velocity Index (0–100):** Real-time algorithm synthesizing weekly learning cadence, target hours, project completion ratios, and skill advances into a single actionable velocity rating with an interactive math breakdown dialog.
- **Orbital Planetary Engine:** Multi-ring planetary visualizer built with responsive CSS and SVG geometry. Orbits scale with skill proficiency levels, rotating around the developer core with interactive tooltips, play/pause controls, and an accessible Constellation Grid toggle.
- **Live Stream Previews:** Instant glance at recent mission logs, active space mission flightpaths, and upcoming milestone horizons.

### 2. 🪐 Skill Universe (Competency Engine)
- **Taxonomy Categories:** Organize proficiencies across **Programming Languages, Web Development, AI & Machine Learning, Data Science, Databases, DevOps & Cloud, and Computer Science**.
- **Proficiency Tracking:** Progress from Beginner (0–24%) $\rightarrow$ Intermediate (25–49%) $\rightarrow$ Advanced (50–74%) $\rightarrow$ Expert (75–100%).
- **Quick-Step Adjusters:** Adjust skill percentages with 1-click `+10%` / `-10%` buttons directly from skill cards.
- **Fast Search & Filter:** Filter by category, proficiency tier, learning status (Not Started, In Progress, Completed), or search keyword.

### 3. 📝 Mission Logs (Learning Progress Tracker)
- **Multi-Disciplinary Session Logging:** Record sessions across **Coding, Reading & Documentation, Practice Problems & LeetCode, Project Development, Technical Research, and Tutorials**.
- **Animated Daily Goal Ring:** Visual SVG circular gauge tracking hours logged today against your customized daily target.
- **Aggregated Analytics:** Real-time stats calculating all-time hours, weekly volume, monthly velocity, average session length, and total sessions completed.
- **Chronological Timeline:** Grouped timeline cards with direct inline session editing, date filters, and category badges.

### 4. 🛰 Space Missions (Developer Project Tracker)
- **Flightpath Progress Tracker:** Monitor progress bars (0–100%), delivery status (**Planning, In Progress, On Hold, Completed**), and launch target dates.
- **Dynamic Tag System:** Add, remove, and filter custom technology badges (e.g. `React`, `Docker`, `FastAPI`, `GraphQL`).
- **Verified Link Integrations:** Embedded direct actions for GitHub repository source code and deployed live production URLs with automated sanitization.

### 5. 🎯 Milestones (Goal Management)
- **Target Horizons:** Structure long-term engineering ambitions with designated target completion dates.
- **Priority Tiering:** Categorize milestones by priority: **Critical, High, Medium, or Low**.
- **Automated Overdue Detection:** Highlights horizons that have exceeded their target deadline with clear visual flags.
- **Status Metrics:** Real-time summary displaying total milestones, active horizons, completed goals, and overall completion percentages.

### 6. ⭐ Universe Achievements
- **Deterministic Badges:** 10 unlocks triggered strictly by genuine user activity:
  - *First Orbit* (Created your first skill)
  - *Skill Pioneer* (Added 5 skills)
  - *Orbit Master* (Reached 100% on any skill)
  - *Log Initialized* (Logged first learning sprint)
  - *Century Club* (Completed 100 hours of learning)
  - *Mission Launched* (Created first project)
  - *Mission Accomplished* (Completed a project)
  - *Horizon Reached* (Completed a milestone)
  - *Deep Space Voyager* (Maintained a 7-day streak)
  - *Universe Architect* (Created 10 skills and completed 3 projects)
- **Web Audio Chime Synthesizer:** Celebratory custom sound synthesis using browser `AudioContext` without external MP3 audio assets.

### 7. 📊 Universe Analytics
- **5 Custom Chart.js Visualizers:**
  1. *Weekly Learning Distribution* (Mon–Sun daily hours bar chart)
  2. *30-Day Velocity Trajectory* (Smooth glowing line chart tracking cumulative activity)
  3. *Skill Category Breakdown* (Doughnut distribution of competencies)
  4. *Space Mission Status* (Doughnut ratio of project pipeline)
  5. *Activity Type Allocation* (Horizontal bar chart of learning methods)
- **Automated Developer Insights:** Heuristic engine detecting your top focus skill, highest-output day of the week, and active milestone momentum.

### 8. ⚙️ System Settings & Data Sovereignty
- **Developer Profile Customization:** Custom pilot name, title, bio, GitHub handle, and 6 cosmic avatar presets.
- **Theme Engine:** Instant switching between **Cosmic Dark Theme** (default) and **Orbital Light Theme** with persisted preference.
- **Full Data Backup & Restore:** Export complete state as clean, timestamped `codeorbit-universe-YYYY-MM-DD.json`.
- **Validation Engine:** Strict schema validation checks during JSON import to prevent data corruption.
- **Demo Mode & Clean Slate:** Load comprehensive pre-populated universe data for exploration, or perform a complete factory wipe.

### 9. 🔍 Global Command Palette (`Ctrl+K` / `Cmd+K`)
- **Instant Universal Search:** Accessible from anywhere via keyboard shortcut or header search bar.
- **Keyboard Navigation:** Navigate matching skills, projects, logs, and milestones using `ArrowUp`, `ArrowDown`, and `Enter`.

---

## 🛠 Technology Stack

CodeOrbit embraces a **pure, standards-based vanilla web architecture** designed for performance, accessibility, and zero-barrier open-source contribution:

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Markup** | HTML5 Semantic Elements | High accessibility, screen-reader support, native `<dialog>` modals |
| **Styling** | Modern CSS3 & CSS Variables | Fast rendering, glassmorphic effects, fluid grid/flexbox layouts |
| **Scripting** | Vanilla JavaScript (ES6+ Modules) | Zero bundlers, instant native browser execution, clean module boundaries |
| **Storage** | Browser `localStorage` API | 100% client-side privacy, persistent across sessions, zero network latency |
| **Visuals** | Chart.js 4.4+ (CDN) | Lightweight, accessible, canvas-based statistical visualizers |
| **Icons** | Lucide Icons (CDN) | Modern, clean, crisp SVG vector icons |
| **Audio** | HTML5 Web Audio API | Custom procedural audio chimes without external media downloads |
| **Fonts** | Inter & JetBrains Mono (Google Fonts) | Optimized readability for dashboards and code-adjacent metrics |

> **Strict Architectural Rules:**  
> ❌ No React • ❌ No Next.js • ❌ No Vue • ❌ No TypeScript • ❌ No Tailwind CSS • ❌ No Bootstrap • ❌ No Backend Server • ❌ No Paid APIs

---

## 🏗 System Architecture

CodeOrbit operates as an event-driven, single-page application (SPA) centered on an atomic data manager and a reactive event bus:

```text
+---------------------------------------------------------------------------+
|                              BROWSER DOM                                  |
|   index.html (Semantic Containers, Modals, Views, Command Palette)        |
+---------------------------------------------------------------------------+
                                     ▲
                                     │  (Dynamic Rendering & Event Binding)
                                     ▼
+---------------------------------------------------------------------------+
|                          MODULE CONTROLLERS                               |
|   dashboard.js  •  skills.js  •  progress.js  •  projects.js  •  goals.js  |
|   analytics.js  •  achievements.js  •  settings.js  •  components.js      |
+---------------------------------------------------------------------------+
         ▲                                                ▲
         │ (Trigger UI updates)                           │ (CRUD mutations)
         ▼                                                ▼
+---------------------------------------------------------------------------+
|                       REACTIVE EVENT BUS                                  |
|               window.dispatchEvent('codeorbit:data-changed')             |
+---------------------------------------------------------------------------+
                                     ▲
                                     │ (Reads / Writes)
                                     ▼
+---------------------------------------------------------------------------+
|                     CENTRAL STORAGE SINGLETON                             |
|                           storage.js                                      |
|    Schema validation  •  Seed initialization  •  Atomic state mutations   |
+---------------------------------------------------------------------------+
                                     ▲
                                     │ (Serialization)
                                     ▼
+---------------------------------------------------------------------------+
|                     BROWSER LOCALSTORAGE                                  |
|         Key: 'codeorbit_data'  |  Format: JSON Object                     |
+---------------------------------------------------------------------------+
```

### Architectural Highlights
1. **Centralized Data Store (`storage.js`):** All read and write operations route through safe getter/setter functions. Direct mutations to `localStorage` are prohibited elsewhere in the codebase.
2. **Reactive Event Bus (`codeorbit:data-changed`):** When any record is added, updated, deleted, or imported, `storage.js` broadcasts a custom event. All active views reactively re-render, ensuring cross-page telemetry is always synchronized.
3. **Hash-Based Routing (`navigation.js`):** Lightweight client-side navigation using URL hashes (`#dashboard`, `#skills`, `#progress`, `#projects`, `#goals`, `#achievements`, `#analytics`, `#settings`) with browser history support (`popstate`).
4. **XSS Defense-in-Depth (`utils.js`):** All user input strings are strictly escaped via `escapeHTML()` before being injected into HTML templates.
5. **Chart Lifecycle Management (`charts.js`):** Chart instances are tracked and safely destroyed (`chart.destroy()`) before re-instantiation, preventing canvas memory leaks.

---

## 📁 Folder Structure

```text
CodeOrbit/
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml          # Structured GitHub bug report issue form
│   │   └── feature_request.yml     # Structured GitHub feature request issue form
│   ├── workflows/
│   │   └── deploy.yml              # GitHub Pages continuous deployment action
│   └── PULL_REQUEST_TEMPLATE.md    # Contributor checklist & PR guidelines
├── assets/
│   ├── css/
│   │   ├── style.css               # Design tokens, CSS variables, base layout & resets
│   │   ├── components.css          # Reusable buttons, cards, inputs, badges, modals
│   │   ├── dashboard.css           # Command Center hero, telemetry cards, velocity ring
│   │   ├── orbital.css             # Dynamic planetary SVG/CSS orbital animation engine
│   │   └── responsive.css          # Media queries (Desktop, Laptop, Tablet, Mobile)
│   ├── images/
│   │   ├── favicon.svg             # Cosmic orbital SVG favicon
│   │   └── logo.svg                # Vector CodeOrbit brand mark
│   └── js/
│       ├── app.js                  # Master bootstrap, routing dispatcher & canvas starfield
│       ├── storage.js              # Centralized LocalStorage manager & migration engine
│       ├── utils.js                # XSS sanitization, math scoring, Web Audio chimes
│       ├── navigation.js           # Hash routing, mobile drawer toggles & navigation state
│       ├── components.js           # Modal dialog system, toast notifications, Command Palette
│       ├── dashboard.js            # Command Center KPI calculations & orbital renderers
│       ├── skills.js               # Skill Universe CRUD, category filters, progress stepping
│       ├── progress.js             # Mission Logs sprint tracking & daily goal circular ring
│       ├── projects.js             # Space Missions project manager & tech stack tags
│       ├── goals.js                # Milestones target horizons & overdue detection
│       ├── achievements.js         # Real-time condition evaluation & achievement unlocks
│       ├── analytics.js            # Analytics calculations & automated habit insights
│       ├── settings.js             # Profile management, theme toggle, JSON backup/restore
│       └── charts.js               # Chart.js cosmic gradient configurations & lifecycle
├── docs/
│   ├── ARCHITECTURE.md             # Detailed engineering system design & data schemas
│   ├── CODE_OF_CONDUCT.md          # Contributor Covenant 2.1 code of conduct
│   ├── CONTRIBUTING.md             # Detailed guide for open-source contributors
│   └── SECURITY.md                 # Security model, reporting policies & boundaries
├── .gitignore                      # Git ignore rules for OS files, logs, and artifacts
├── CODE_OF_CONDUCT.md              # Root Code of Conduct link
├── CONTRIBUTING.md                 # Root Contributing guide
├── index.html                      # Semantic single-page application entry point
├── LICENSE                         # MIT License file
├── README.md                       # Main project documentation
└── SECURITY.md                     # Root Security policy link
```

---

## ⚡ Quick Start & Local Development

Because CodeOrbit uses native JavaScript ES Modules (`import`/`export`), web browsers require files to be served via HTTP or HTTPS rather than the raw `file://` protocol.

Getting started takes less than **60 seconds**:

### Prerequisites
- A modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Apple Safari).
- Git installed on your system.
- Any lightweight local web server (Python, VS Code, or Node).

### 1. Clone the Repository
```bash
git clone https://github.com/LetsCook-Organization/CodeOrbit.git
cd CodeOrbit
```

### 2. Launch Local Server

Choose any method that fits your environment:

#### Option A: Python (Built into Windows, macOS, Linux)
```bash
# Python 3
python -m http.server 3000
```

#### Option B: VS Code Live Server (Beginner Recommended)
1. Open the `CodeOrbit` folder in VS Code.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click `index.html` in the file tree $\rightarrow$ click **"Open with Live Server"**.

#### Option C: Node.js `npx serve`
```bash
npx serve .
```

### 3. Open Your Universe
Point your browser to:
```text
http://localhost:3000
```
*(or the local port displayed in your terminal)*.

---

## 🗺 Roadmap

CodeOrbit follows a transparent, community-driven development roadmap:

### 🌟 Phase 1: Core Genesis (Completed — v1.0.0)
- [x] Complete 9-module Single Page Application architecture.
- [x] Responsive Command Center with dynamic telemetry and planetary orbital visualizer.
- [x] Comprehensive CRUD engines for Skills, Mission Logs, Space Missions, and Milestones.
- [x] Deterministic Developer Velocity Index (0–100) and automated habit insights.
- [x] 10 reactive Universe Achievements with procedural Web Audio chimes.
- [x] Dual cosmic dark and orbital light themes.
- [x] Full JSON data export, schema-validated import, demo data seeder, and reset utility.
- [x] Global Command Palette (`Ctrl+K` / `Cmd+K`) with keyboard navigation.

### 🔭 Phase 2: Horizons & Expansion (Current Focus — v1.1.0)
- [ ] **Interactive Pomodoro Sprint Timer:** In-dashboard focus timer with cosmic visual countdowns that automatically logs completed sessions into Mission Logs.
- [ ] **Export Reports to Markdown & CSV:** Generate shareable resume-ready skill matrices and progress reports.
- [ ] **Custom Tag Color Coding:** Allow developers to customize tag colors for project technologies and milestone categories.
- [ ] **Web Share API Integration:** Share milestone completions and unlocked universe badges as clean summary cards.

### 🌌 Phase 3: Offline PWA & Long-Range Telemetry (Planned — v1.2.0)
- [ ] **Progressive Web App (PWA):** Service worker caching for installability on desktop and mobile with 100% offline access.
- [ ] **Yearly Contribution Heatmap:** GitHub-style 365-day orbital activity matrix reflecting daily learning density.
- [ ] **Multi-Profile Support:** Manage separate developer profiles (e.g. Work vs. Personal Open-Source).

---

## 🤝 Contributing

We warmly welcome contributions from everyone — whether you are a seasoned software architect or a student making your **very first open-source pull request**!

Please read our [Contributing Guide](CONTRIBUTING.md) for full instructions on:
- How to fork and clone the repository.
- Setting up your local environment with zero build tooling.
- Conventional commit message standards (`feat:`, `fix:`, `docs:`, `style:`, etc.).
- Testing and verifying your changes before submitting.
- Submitting an accessible, descriptive pull request.

To report bugs or propose feature enhancements, please use our [GitHub Issue Templates](https://github.com/LetsCook-Organization/CodeOrbit/issues/new/choose).

Please also review our [Code of Conduct](CODE_OF_CONDUCT.md) to ensure an open, welcoming, and harassment-free community environment.

---

## 🍳 Organization

**LET'S COOK — THE FOUNDRY** is an open-source development guild dedicated to crafting beautiful, high-performance, developer-first tools. We believe in:
- **Radical Simplicity:** Tools that run everywhere without requiring fragile dependency chains.
- **Data Sovereignty:** Software that respects user privacy and keeps data under local user ownership.
- **Craftsmanship & Joy:** Developing software that is both technically robust and visually delightful.

---

## 📄 License

CodeOrbit is open-source software licensed under the **[MIT License](LICENSE)**.

```text
Copyright (c) 2026 LET'S COOK — THE FOUNDRY

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

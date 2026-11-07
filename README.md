# CodeOrbit — Your Universe of Developer Growth

<p align="center">
  <img src="assets/images/logo.svg" alt="CodeOrbit Logo" width="120" height="120">
</p>

<p align="center">
  <strong>Your Universe of Developer Growth.</strong><br>
  A personal developer productivity and learning management platform that transforms your technical journey into a structured, visually stunning, cosmic experience.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#visual-design">Visual Design</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#contributing">Contributing</a> •
  <a href="LICENSE">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Organization-LET'S_COOK_—_THE_FOUNDRY-7C3AED?style=for-the-badge" alt="LET'S COOK — THE FOUNDRY">
  <img src="https://img.shields.io/badge/Stack-Vanilla_JS_ES6+-38BDF8?style=for-the-badge" alt="Vanilla JS">
  <img src="https://img.shields.io/badge/Storage-LocalStorage-22C55E?style=for-the-badge" alt="LocalStorage">
  <img src="https://img.shields.io/badge/License-MIT-F97316?style=for-the-badge" alt="MIT License">
  <img src="https://img.shields.io/badge/Zero-Dependencies-6366F1?style=for-the-badge" alt="Zero Dependencies">
</p>

---

## 🌌 Project Vision

**CodeOrbit** is an open-source personal developer growth operating system created for **LET'S COOK — THE FOUNDRY**. It helps students and engineers track their technical competencies, learning sprints, coding projects, goals, and daily productivity without requiring backend servers, cloud databases, paid accounts, or tracking.

Everything runs privately and deterministically inside the browser via `localStorage`, featuring deep-space aesthetics, planetary orbital visualizers, and SaaS dashboard architecture.

---

## 🚀 Key Modules & Capabilities

### 1. 🪐 Command Center (Dashboard)
- **Cinematic Cosmic Hero:** Live local date, personalized greeting, active Orbit Streak indicator, and rapid session launcher.
- **Dynamic KPI Telemetry:** 4 real-time stat cards calculating active vs. completed skills, all-time vs. weekly learning hours, ongoing space missions, and unbroken streak days.
- **Developer Velocity Index (0–100):** Deterministic productivity score combining weekly consistency, learning hours vs. target, project progress, and skill advancements, complete with a breakdown formula modal.
- **Orbital Skill Visualization:** Dynamic multi-ring planetary visualization where orbiting bodies scale with skill progress and rotate in orbits around the Developer Core. Includes pause/resume and an accessible **Constellation Grid** view.
- **Weekly Learning Analytics:** Interactive Chart.js bar chart of hours logged across Monday through Sunday.
- **Live Previews:** Immediate activity stream, active project flightpaths, and upcoming milestone horizons.

### 2. 🪐 Skill Universe (Competency Engine)
- Track competencies across **Programming, Web Development, AI, Machine Learning, Data Science, Database, DevOps, and Computer Science**.
- Filter by category, proficiency level (Beginner to Expert), and status (Not Started, Learning, Practicing, Completed).
- Quick progress stepping (+10% / -10%) right on cards.
- Full CRUD with responsive modal dialogs and validation.

### 3. 📝 Mission Logs (Learning Progress & Sprints)
- Log focused blocks across **Coding, Reading, Practice Problems, Project Development, Research, and Tutorials**.
- Dynamic **Daily Learning Goal Gauge** with animated SVG circular progress.
- Computes all-time hours, weekly volume, monthly velocity, average session duration, and total sessions.
- Comprehensive search, activity type filters, and timeline history.

### 4. 🛰 Space Missions (Developer Project Tracker)
- Portfolio and build manager tracking flightpath progress (0–100%), status (Planning, In Progress, On Hold, Completed), and target dates.
- Interactive tech stack tag editor.
- Verified one-click links to GitHub repositories and live deployments.

### 5. 🎯 Milestones (Goal Management)
- Set technical objectives with priority tags (**Critical, High, Medium, Low**) and target deadlines.
- Automatically calculates goal completion rate, active milestones, and flagged **overdue horizons**.
- 1-click completion toggle and progress adjustment.

### 6. ⭐ Universe Achievements
- 10 unlockable badges that trigger exclusively on genuine user data (e.g. *First Orbit*, *Learning Explorer*, *Deep Space Voyager 7-Day Streak*, *Century Club 100 Hours*).
- Built-in celebratory chime synthesized via client-side Web Audio API (zero MP3 dependencies).

### 7. 📊 Universe Analytics
- 5 comprehensive Chart.js visualizers:
  1. Weekly Learning Distribution (Mon–Sun bar chart)
  2. 30-Day Velocity Trajectory (Smooth glowing gradient line chart)
  3. Skill Category Breakdown (Doughnut chart)
  4. Space Mission Status Breakdown (Doughnut chart)
  5. Activity Type Distribution (Horizontal bar chart)
- **Automated Developer Habit Insights:** Detects your top focus skill, peak velocity day of the week, and milestone trajectory.

### 8. ⚙️ System Settings & Data Sovereignty
- **Developer Identity:** Custom name, role, bio, GitHub handle, and 6 cosmic avatar presets.
- **Appearance:** Cosmic Dark Theme (default) and Orbital Light Theme toggle.
- **JSON Backup & Restore:** Export full state as `codeorbit-universe-YYYY-MM-DD.json`, validate and restore backups, load pre-populated demo data, or safely wipe to a clean slate.

### 9. 🔍 Global Command Palette (`Ctrl+K`)
- Instant keyboard search across all skills, space missions, logs, and milestones with fuzzy matching and keyboard navigation.

---

## 🛠 Technology Stack

CodeOrbit strictly adheres to a clean, beginner-friendly vanilla architecture:

- **Markup:** HTML5 (Semantic, Accessible, ARIA compliant)
- **Styling:** CSS3 (Custom Design System, CSS Variables, Glassmorphism, Responsive Grid & Flexbox)
- **Scripting:** Vanilla JavaScript ES6+ (Modular ES Modules: `import`/`export`)
- **Persistence:** Browser `localStorage` (Atomic, safe, validated)
- **Iconography:** Lucide Icons (Clean, modern SVG glyphs)
- **Data Visualization:** Chart.js 4.4+ (Custom dark cosmic theme styling)
- **Typography:** Google Fonts (Inter & JetBrains Mono)

> **Strict Constraints Followed:**  
> No React • No Next.js • No Vue • No Angular • No TypeScript • No Tailwind CSS • No Bootstrap • No Backend Server • No Paid APIs

---

## 🎨 Design System

| Token | Dark Theme (Default) | Role |
| :--- | :--- | :--- |
| `--bg-main` | `#080D1B` | Deep cosmic canvas background |
| `--bg-secondary` | `#0E1528` | Topbar and secondary surface |
| `--bg-sidebar` | `#10152B` | Navigation sidebar background |
| `--bg-card` | `#131D33` | Primary cards and widgets |
| `--bg-card-elevated`| `#19243D` | Elevated surfaces and modal containers |
| `--primary` | `#7C3AED` | Electric Violet brand accent |
| `--secondary` | `#6366F1` | Stellar Indigo secondary accent |
| `--cyan-accent` | `#38BDF8` | Celestial Cyan telemetry & highlights |
| `--orbital-orange` | `#F97316` | Solar Orange streak & alerts |
| `--success` | `#22C55E` | Emerald completion token |
| `--warning` | `#F59E0B` | Amber alert token |
| `--danger` | `#EF4444` | Red overdue & warning token |
| `--text-primary` | `#F8FAFC` | Primary white text |
| `--text-secondary`| `#94A3B8` | Muted secondary text |
| `--border` | `#25314A` | Subtle planetary structural dividers |

---

## ⚡ Quick Start & Local Development

No build tools, bundlers, or package installations needed.

### 1. Clone the repository
```bash
git clone https://github.com/LetsCook-Organization/CodeOrbit.git
cd CodeOrbit
```

### 2. Run with any local HTTP server
Because native ES Modules require standard HTTP/HTTPS origin policies:

**Option A (Python):**
```bash
python -m http.server 3000
```

**Option B (Node / npx):**
```bash
npx serve .
```

**Option C (VS Code):**
Right-click `index.html` and select **Open with Live Server**.

### 3. Open in Browser
Navigate to `http://localhost:3000` to launch your developer universe!

---

## 📱 Responsive Testing Matrix

Tested and optimized across all major breakpoints without horizontal overflow:
- **Desktop:** 1440px+
- **Laptop:** 1024px – 1200px
- **Tablet:** 768px – 1024px (Mobile drawer toggle & responsive cards)
- **Mobile:** 375px – 480px (Full-width touch controls & collapsible search)

---

## 👥 Organization & Community

**Organization:** LET'S COOK — THE FOUNDRY  
**Maintainers:** Open-source contributors & community builders  

Contributions of all skill levels are welcomed! Please read [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) to get started.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.

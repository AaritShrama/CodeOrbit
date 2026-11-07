# CodeOrbit — Code Execution Flow

This document traces **how execution moves between files**: what runs first, in what order, and which function calls which. Read it alongside [`ARCHITECTURE.md`](ARCHITECTURE.md) (what the pieces are) and [`DECISIONS.md`](DECISIONS.md) (why they are that way).

> Function names are used instead of line numbers so this file does not go stale on every edit. If you rename or move a function listed here, update this file in the same PR.

---

## 1. The 30-second version

```
index.html
  └─ loads Chart.js + Lucide (global scripts)
  └─ loads assets/js/app.js  (ES module, runs after HTML is parsed)
        │
        ├─ import phase: every module file is evaluated once,
        │   creating 5 singletons: sounds, storage, navigation, toast, chartManager
        │
        └─ initApp()
              ├─ theme, starfield, shortcuts, topbar
              ├─ register 8 views with the router
              ├─ init every page (each one renders itself once)
              ├─ navigation.init()  → shows the page named in the URL hash
              └─ listen for 'codeorbit:data-changed'

After that, everything is driven by user events, and every data change follows ONE loop:

  user action → page handler → storage.saveX() → storage.saveUniverse()
             → localStorage write → dispatch 'codeorbit:data-changed'
             → listeners re-check achievements, update badges, re-render the visible page
```

---

## 2. Entry point

**`index.html`** is the only HTML page. Script loading order:

| Order | What | How it loads | Result |
|---|---|---|---|
| 1 | CSS files (`style`, `components`, `dashboard`, `orbital`, `responsive`) | `<link>` in `<head>` | Styles ready before first paint |
| 2 | Chart.js 4.4.7 (jsDelivr) | classic `<script>` in `<head>`, blocking | Creates global `window.Chart` |
| 3 | Lucide (unpkg) | classic `<script>` in `<head>`, blocking | Creates global `window.lucide` |
| 4 | `assets/js/app.js` | `<script type="module">` at the end of `<body>` | Module scripts are deferred: runs **after** the whole HTML is parsed |

All 8 screens already exist in the HTML as `<section class="view-page" id="view-…">`. JavaScript never creates pages; it only shows/hides them and fills them with data.

---

## 3. Phase 1: module import (before any page code runs)

When the browser runs `app.js`, it first resolves its `import` statements **depth-first**. Each file is evaluated exactly once, no matter how many files import it. Code at the top level of a module runs during this phase.

Effective evaluation order:

1. **`utils.js`**: pure helper functions + creates the `sounds` singleton (`new SoundEffects()`; no audio context yet).
2. **`storage.js`**: creates the `storage` singleton. Its constructor calls `storage.init()` **immediately**:
   - reads `localStorage['codeorbit_universe_v1']`
   - **empty?** → builds `getDefaultUniverse()` (demo user "Alex Rivera") and saves it
   - **corrupt?** (not an object, or `skills` is not an array) → replaces it with the demo universe
   - **valid?** → keeps it in `storage.cache`
   - The first-visit save fires `codeorbit:data-changed`, but no one is listening yet, so nothing happens.
3. **`navigation.js`**: creates the `navigation` singleton (`currentRoute = 'dashboard'`, empty view map).
4. **`components.js`**: creates the `toast` singleton (container is created lazily on first toast).
5. **`charts.js`**: creates the `chartManager` singleton (empty map of chart instances).
6. **`dashboard.js`, `skills.js`, `progress.js`, `projects.js`, `goals.js`, `achievements.js`, `analytics.js`, `settings.js`**: only define functions and module-level state (filters, sort order, view mode). Nothing renders yet.
7. **`app.js`** body runs: because the document is already parsed, `document.readyState !== 'loading'`, so it calls **`initApp()` directly**.

---

## 4. Phase 2: `initApp()` startup sequence (`app.js`)

Runs once, in this exact order:

| Step | Call | What it does |
|---|---|---|
| 1 | `storage.getSettings()` → `applyTheme(theme, false)` *(settings.js)* | Sets `data-theme` on `<html>`, swaps the topbar theme icon. `false` = don't save. |
| 2 | `initCosmicStarfield()` *(app.js)* | Draws the background star canvas; starts a `requestAnimationFrame` loop unless the OS asks for reduced motion. |
| 3 | `setupModalDismissHandlers()` *(components.js)* | Global listeners: **Esc** closes the open modal + command palette; clicking a backdrop or `[data-modal-close]` closes its modal. |
| 4 | `setupGlobalShortcuts()` *(app.js)* | **Ctrl/Cmd+K** or **/** → `openCommandPalette()`; typing in the palette → `renderPaletteResults(query)`. |
| 5 | `setupTopbarInteractions()` *(app.js)* | Quick-action menu (log session / add skill / new project / new goal → each page's `openXModal()`), notifications dropdown, close-on-outside-click; calls `updateNotificationsPanel()` once. |
| 6 | `navigation.registerView(route, fn)` ×8 | Maps `'dashboard' → renderDashboard`, `'skills' → renderSkills`, … `'settings' → renderSettings`. |
| 7 | `initDashboard()`, `initSkills()`, `initProgress()`, `initProjects()`, `initGoals()`, `initAchievements()`, `initAnalytics()`, `initSettings()` | Each attaches its page's button/form/filter listeners **and renders its page once** (see §5). |
| 8 | `navigation.init()` | Attaches sidebar + mobile-menu listeners, listens for `hashchange`, then calls `handleHashChange()` → `navigateTo(route)` → **renders the visible page again**. Also calls `updateBadges()` and subscribes it to `data-changed`. |
| 9 | `window.addEventListener('codeorbit:data-changed', …)` | The main re-render listener (see §6). |
| 10 | `lucide.createIcons()` | Replaces `<i data-lucide="…">` placeholders with SVG icons. |

The whole sequence is wrapped in `try/catch`: if any step throws, the error is logged and **later steps do not run**.

---

## 5. What each page's `init` does

Every page module follows the same shape: **`initX()` = attach listeners + `renderX()`**. Listeners only change module state or call `storage`; they never edit other pages.

| Module | `init` attaches | `render` reads | `render` calls |
|---|---|---|---|
| `dashboard.js` | Orbit pause/resume, orbital ↔ constellation toggle, weekly/monthly chart tabs, score-breakdown button | whole universe | `calculateStreak`, `calculateProductivityScore` *(utils)*, `populateScoreModal`, `renderOrbitalVisualization` (or `renderConstellationGrid`), `chartManager.renderWeeklyChart`/`renderMonthlyTrendChart`, `chartManager.renderSkillCategoryChart`, `renderRecentLogs`, `renderActiveProjects`, `renderUpcomingGoals` |
| `skills.js` | Search, category filter, status pills, sort, Add button, form submit, progress slider label | `skills` | per-card `+10%/−10%` → `stepSkillProgress`, ⋮ menu → `showSkillContextMenu` → edit (`openSkillModal`) / delete (`showConfirmDialog` → `storage.deleteSkill`) |
| `progress.js` | Search, type filter, skill filter, sort, "Launch session" button, form submit | `activities`, `skills` | `populateSkillFilterOptions`, `openActivityModal`, delete via `showConfirmDialog` |
| `projects.js` | Search, status pills, sort, Create button, form submit, progress slider label, technology tag input | `projects` | `renderModalTags`, `openProjectModal`, delete via `showConfirmDialog` |
| `goals.js` | Search, status pills, priority filter, Create button, form submit, progress slider label | `goals` | `toggleGoalComplete`, `openGoalModal`, delete via `showConfirmDialog` |
| `achievements.js` | Category pills; **its own `data-changed` listener** | `achievements` + `ACHIEVEMENT_DEFINITIONS` | `evaluateAchievements()` before first render |
| `analytics.js` | nothing (no listeners) | whole universe | `calculateStreak`, 5 × `chartManager.render…Chart`, `generateHabitInsights` |
| `settings.js` | Section nav, profile form, preferences form, theme select, topbar theme toggle, avatar picker, export, import, load demo, reset | `profile`, `settings` | `applyTheme`, `updateSidebarProfile` |

---

## 6. The data-change loop (the heart of the app)

Example: **user adds a skill.**

```
1. Click "Add Skill"            skills.js   → openSkillModal()      → components.openModal('skill-modal')
2. Fill form, press Save        skills.js   → handleSkillFormSubmit(e)
                                                ├─ reads + trims form fields, validates name
                                                ├─ progress 100 ⇒ status 'Completed'
                                                ├─ storage.saveSkill(skillData)
                                                ├─ closeModal('skill-modal')
                                                └─ toast.success(...)        → sounds.success()
3.                              storage.js  → saveSkill(skill)
                                                ├─ getUniverse()   (deep copy of cache)
                                                ├─ has id? update in place : generateId('sk_') + push
                                                └─ saveUniverse(data)
4.                              storage.js  → saveUniverse(data)
                                                ├─ this.cache = data
                                                ├─ localStorage.setItem(KEY, JSON.stringify(data))
                                                └─ window.dispatchEvent('codeorbit:data-changed')   ← synchronous
5. Listeners fire in registration order:
   a. achievements.js (registered in step 7 of initApp)  → evaluateAchievements() + renderAchievements()
   b. navigation.js   (registered in step 8)             → updateBadges()   (sidebar counters)
   c. app.js          (registered in step 9)             → evaluateAchievements()
                                                          → render<CurrentRoute>()
                                                          → updateNotificationsPanel()
                                                          → lucide.createIcons()
```

The same loop applies to every write: `saveActivity`, `saveProject`, `saveGoal`, `deleteX`, `saveProfile`, `saveSettings`, `unlockAchievement`, `importJSON`, `resetAllData`, `loadDemoUniverse`.

### When an achievement unlocks inside the loop

`evaluateAchievements()` → `storage.unlockAchievement(id)` → `saveUniverse()` → **dispatches `data-changed` again, while the first dispatch is still running.** The nested round runs all three listeners again (re-rendering the page a second time). Infinite recursion is prevented only by the `isEvaluating` flag in `achievements.js`, which makes the nested `evaluateAchievements()` calls return immediately. Then `toast.achievement(...)` shows the popup and plays the chime.

---

## 7. Navigation flow

```
Sidebar click          → navigation.navigateTo(route)
                           └─ sets location.hash = '#route' and RETURNS
Browser fires hashchange → navigation.handleHashChange()
                           └─ unknown/empty hash ⇒ 'dashboard'
                           └─ navigateTo(route, updateHash = false)
                                ├─ hide all .view-page, show #view-<route>
                                ├─ highlight the active .nav-link
                                ├─ set topbar title/subtitle from ROUTE_CONFIG
                                ├─ call the registered render function (try/catch)
                                ├─ scroll to top
                                └─ lucide.createIcons()
```

Command-palette results navigate the same way: they set `window.location.hash` directly and close the palette.

---

## 8. Other flows

**Command palette (Ctrl+K):** `openCommandPalette()` → clears input → `renderPaletteResults('')` → searches skills, projects, activities, goals in `storage.getUniverse()` → shows the first 10 matches → click → set hash → `closeCommandPalette()`.

**Export:** `handleExportJSON()` → `storage.exportJSON()` (pretty JSON) → `Blob` → temporary `<a download>` click → file `codeorbit-universe-YYYY-MM-DD.json`.

**Import:** file input `change` → `handleImportFile()` → `FileReader.readAsText` → `showConfirmDialog` → `storage.importJSON(text)` (validates required arrays, fills missing profile/settings from defaults, clamps progress to 0–100, duration ≥ 1) → `saveUniverse` → normal data-change loop → `renderSettings()` → toast.

**Load demo / Reset:** confirm dialog → `storage.loadDemoUniverse()` / `storage.resetAllData()` → data-change loop → `renderSettings()`.

**Theme toggle:** topbar button → `applyTheme(next)` → sets `data-theme` → `storage.saveSettings({ theme })` (save defaults to `true`) → data-change loop. Charts pick up the theme through `chartManager.getThemeColors()` the next time they render.

**Charts:** every `chartManager.render…Chart(canvasId, data)` first checks the canvas exists and `window.Chart` is loaded, calls `destroyChart(canvasId)` to free the old instance, builds a new `Chart`, and stores it in `chartManager.instances`.

---

## 9. Dependency map (who imports whom)

```
app.js ──► storage, navigation, components, dashboard, skills, progress,
           projects, goals, achievements, analytics, settings, utils

dashboard.js ──► storage, utils, charts, components
analytics.js ──► storage, utils, charts
skills / progress / projects / goals.js ──► storage, utils, components
achievements.js ──► storage, utils, components
settings.js ──► storage, utils, components
navigation.js ──► storage
components.js ──► storage, utils
storage.js ──► utils
charts.js ──► (none — uses global window.Chart)
utils.js ──► (none)
```

`utils.js` is the leaf; `storage.js` is the only module that touches `localStorage`. Page modules never import each other. They talk only through `storage` and the `data-changed` event; `app.js` is the only file that imports page modules.

---

## 10. Behaviour to know about (current state, not yet fixed)

These are facts about the code as of this document, found while tracing it. Each should become an issue.

1. **Every page renders twice on load.** Each `initX()` renders its page, then `navigation.init()` renders the visible page again.
2. **One save triggers `evaluateAchievements()` twice** (the `achievements.js` and `app.js` listeners both call it), and an unlock re-renders the current page a second time (§6).
3. **Three different definitions of "the last 7 days":**
   - `utils.calculateProductivityScore` uses **local** dates (`getRelativeISO`).
   - `dashboard.renderDashboard` uses **UTC** dates (`toISOString()`). In India (UTC+5:30), between 00:00 and 05:30 the dashboard's "this week" window is shifted by a day relative to the score.
   - `analytics.renderAnalytics` uses a rolling `now − 7×24h` window.
   The same sessions can show different weekly hours on different screens.
4. **Saving preferences writes twice:** `handlePreferencesSubmit` calls `storage.saveSettings()` and then `applyTheme(theme)`, which saves again, so the data-change loop runs twice.
5. **First visit loads demo data** (`getDefaultUniverse`), so `initAchievements()` unlocks badges from fake activity before the user has done anything.
6. **`initApp()` fails as a whole.** One exception in any step stops all later steps (e.g. no navigation, no re-render listener).

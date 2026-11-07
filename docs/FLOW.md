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
              ├─ theme, starfield, shortcuts
              ├─ register 8 views with the router
              ├─ init every page (wires listeners only, no rendering)
              ├─ evaluateAchievements() once
              ├─ navigation.init()  → renders ONLY the page named in the URL hash
              └─ listen for 'codeorbit:data-changed'
   (every step runs in its own try/catch: one failure does not stop the rest)

After that, everything is driven by user events, and every data change follows ONE loop:

  user action → page handler → storage.saveX() → storage.saveUniverse()
             → localStorage write → dispatch 'codeorbit:data-changed'
             → the listener re-checks achievements, then re-renders the visible page
```

---

## 2. Entry point

**`index.html`** is the only HTML page. Script loading order:

| Order | What | How it loads | Result |
|---|---|---|---|
| 1 | CSS files (`style`, `components`, `dashboard`, `orbital`, `responsive`) | `<link>` in `<head>` | Styles ready before first paint |
| 2 | Chart.js 4.4.7 (jsDelivr, pinned + SRI hash) | classic `<script>` in `<head>`, blocking | Creates global `window.Chart` |
| 3 | Lucide 1.70.0 (jsDelivr, pinned + SRI hash) | classic `<script>` in `<head>`, blocking | Creates global `window.lucide` |

If a CDN file does not match its `integrity` hash, the browser refuses to run it: `window.Chart` / `window.lucide` stay undefined, charts are skipped and icons stay as empty `<i>` tags, but the rest of the app still works.
| 4 | `assets/js/app.js` | `<script type="module">` at the end of `<body>` | Module scripts are deferred: runs **after** the whole HTML is parsed |

All 8 screens already exist in the HTML as `<section class="view-page" id="view-…">`. JavaScript never creates pages; it only shows/hides them and fills them with data.

---

## 3. Phase 1: module import (before any page code runs)

When the browser runs `app.js`, it first resolves its `import` statements **depth-first**. Each file is evaluated exactly once, no matter how many files import it. Code at the top level of a module runs during this phase.

Effective evaluation order:

1. **`utils.js`**: pure helper functions + creates the `sounds` singleton (`new SoundEffects()`; no audio context yet).
2. **`storage.js`**: creates the `storage` singleton. Its constructor calls `storage.init()` **immediately**:
   - reads `localStorage['codeorbit_universe_v1']`
   - **localStorage blocked?** → runs in memory with `getEmptyUniverse()` (nothing persists)
   - **empty (first visit)?** → `startFresh()` saves `getEmptyUniverse()`. Demo data ("Alex Rivera", `getDefaultUniverse()`) is loaded **only** from Settings → Load Demo Universe.
   - **unreadable?** (bad JSON, not an object, or `skills` is not an array) → copies the raw string to `codeorbit_universe_v1_corrupt_backup`, then `startFresh()`
   - **valid?** → keeps it in `storage.cache`
   - The first-visit save fires `codeorbit:data-changed`, but no one is listening yet, so nothing happens.
3. **`navigation.js`**: creates the `navigation` singleton (`currentRoute = 'dashboard'`, empty view map).
4. **`components.js`**: creates the `toast` singleton (container is created lazily on first toast).
5. **`charts.js`**: creates the `chartManager` singleton (empty map of chart instances).
6. **`dashboard.js`, `skills.js`, `progress.js`, `projects.js`, `goals.js`, `achievements.js`, `analytics.js`, `settings.js`**: only define functions and module-level state (filters, sort order, view mode). Nothing renders yet.
7. **`app.js`** body runs: because the document is already parsed, `document.readyState !== 'loading'`, so it calls **`initApp()` directly**.

---

## 4. Phase 2: `initApp()` startup sequence (`app.js`)

Runs once, in this exact order. **Every step runs through `runStep(name, fn, failures)`**: if a step throws, the error is logged, its name is recorded, and the next step still runs. If anything failed, one `toast.error` at the end names the failed steps.

| Step | Call | What it does |
|---|---|---|
| 1 | `storage.getSettings()` → `applyTheme(theme, false)` *(settings.js)* | Sets `data-theme` on `<html>`, swaps the top-bar theme icon. `false` = don't save. |
| 2 | `initCosmicStarfield()` *(app.js)* | Draws the background star canvas; starts a `requestAnimationFrame` loop unless the OS asks for reduced motion. |
| 3 | `setupModalDismissHandlers()` *(components.js)*, `setupGlobalShortcuts()` *(app.js)* | **Esc** closes the open modal + command palette; backdrop / `[data-modal-close]` clicks close modals. **Ctrl/Cmd+K** or **/** → `openCommandPalette()`; typing → `renderPaletteResults(query)`. |
| 4 | `navigation.registerView(route, fn)` ×8 | Maps `'dashboard' → renderDashboard`, `'skills' → renderSkills`, … `'settings' → renderSettings`. |
| 5 | `initDashboard()` … `initSettings()` (8 calls, each its own step) | Each attaches its page's button/form/filter listeners. **None of them render** (see §5). `initSettings` also fills the profile picture in the top bar, because it is visible on every page. |
| 6 | `evaluateAchievements()` *(achievements.js)* | Unlocks anything already earned (e.g. data imported in another session) **before** the first paint. No listener is registered yet, so its save causes no render. |
| 7 | `navigation.init()` | Attaches the top-bar link listeners, listens for `hashchange`, then `handleHashChange()` → `navigateTo(route)` → `renderCurrentView()`: **the only render during startup.** |
| 8 | `window.addEventListener('codeorbit:data-changed', …)` | The main re-render listener (see §6). |
| 9 | `refreshIcons()` | `lucide.createIcons()` replaces `<i data-lucide="…">` placeholders with SVG icons. |

---

## 5. What each page's `init` does

Every page module follows the same shape: **`initX()` attaches listeners only; `renderX()` draws the page and is called by the router** when the page is shown or when data changes while it is shown. Listeners only change module state or call `storage`; they never edit other pages.

| Module | `init` attaches | `render` reads | `render` calls |
|---|---|---|---|
| `dashboard.js` (Home) | *Add study time* → `openActivityModal`; first-visit *Add your first skill* → `openSkillModal`, *Try it with sample data first* → `storage.loadDemoUniverse()` | whole universe | first visit (no skills, no sessions)? show `#home-empty` and stop; else `renderGreeting`, `renderWeek` (`isWithinLastNDays`, `calculateStreak`), `renderOrbit` (DOM APIs, no `innerHTML`), `renderDays` (`getLastNDaysISO`), `renderComingUp` |
| `skills.js` | Search, category filter, status pills, sort, Add button, form submit, progress slider label | `skills` | per-card `+10%/−10%` → `stepSkillProgress`, ⋮ menu → `showSkillContextMenu` → edit (`openSkillModal`) / delete (`showConfirmDialog` → `storage.deleteSkill`) |
| `progress.js` (Study sessions) | Search, type filter, skill filter, sort, *Add study time* button, form submit | `activities`, `skills` | `populateSkillFilterOptions`, `openActivityModal`, delete via `showConfirmDialog` |
| `projects.js` | Search, status pills, sort, Create button, form submit, progress slider label, technology tag input | `projects` | `renderModalTags`, `openProjectModal`, delete via `showConfirmDialog` |
| `goals.js` | Search, status pills, priority filter, Create button, form submit, progress slider label | `goals` | `toggleGoalComplete`, `openGoalModal`, delete via `showConfirmDialog` |
| `achievements.js` | Category pills (no `data-changed` listener of its own) | `achievements` + `ACHIEVEMENT_DEFINITIONS` | (evaluation happens in `app.js`, see §6) |
| `analytics.js` (Progress) | score-breakdown button → `openModal('score-breakdown-modal')` | whole universe | `calculateProductivityScore`, `populateScoreModal`, badges count, `calculateStreak`, 5 × `chartManager.render…Chart`, `generateHabitInsights` |
| `settings.js` | Section nav, profile form, preferences form, theme select, top-bar theme toggle, avatar picker, export, import, load demo, reset; **fills the top-bar profile picture** | `profile`, `settings` | `applyTheme(theme, false)`, `updateSidebarProfile` |

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
5. One listener fires:
   app.js (registered in startup step 8) → evaluateAchievements()
                                             └─ unlocked something? → return (see below)
                                          → navigation.renderCurrentView()   (error-contained)
                                          → refreshIcons()
```

The same loop applies to every write: `saveActivity`, `saveProject`, `saveGoal`, `deleteX`, `saveProfile`, `saveSettings`, `unlockAchievement`, `importJSON`, `resetAllData`, `loadDemoUniverse`.

### When an achievement unlocks inside the loop

```
app.js listener (outer round)
  └─ evaluateAchievements()            isEvaluating = true
       ├─ collect ALL newly satisfied definitions
       ├─ storage.unlockAchievements(ids)   ← ONE save for all of them
       │    └─ dispatch 'data-changed'  (synchronous, nested round)
       │         └─ app.js listener → evaluateAchievements() returns false (isEvaluating)
       │                            → renderCurrentView(), icons
       ├─ toast.achievement(...) for each unlocked badge
       └─ return true
  └─ return early: the nested round already re-rendered everything
```

Result: one save that unlocks N badges = 2 `data-changed` events and **one** page render.

---

## 7. Navigation flow

```
Top-bar link click     → navigation.navigateTo(route)
                           └─ sets location.hash = '#route' and RETURNS
Browser fires hashchange → navigation.handleHashChange()
                           └─ unknown/empty hash ⇒ 'dashboard'
                           └─ navigateTo(route, updateHash = false)
                                ├─ hide all .view-page, show #view-<route>
                                ├─ highlight the active .nav-link (Badges highlights Progress)
                                ├─ set the page title/subtitle from ROUTE_CONFIG (hidden on Home), document.title
                                ├─ renderCurrentView()  (registered render function, try/catch)
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

**Save preferences:** `handlePreferencesSubmit()` → `storage.saveSettings(all)` (one data-change loop) → `applyTheme(theme, false)` (visual only, no second save).

**Theme toggle:** top-bar button → `applyTheme(next)` → sets `data-theme` → `storage.saveSettings({ theme })` (save defaults to `true`) → data-change loop. Charts pick up the theme through `chartManager.getThemeColors()` the next time they render.

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
charts.js ──► utils (plus the global window.Chart)
utils.js ──► (none)
```

`utils.js` is the leaf; `storage.js` is the only module that touches `localStorage`. Page modules never import each other. They talk only through `storage` and the `data-changed` event; `app.js` is the only file that imports page modules.

---

## 10. Rules that keep this flow correct

1. **Calendar days are local, never UTC.** Use `getTodayISO()`, `getRelativeISO(n)`, `toLocalISO(date)`, `getLastNDaysISO(n)` and `isWithinLastNDays(dateStr, n)` from `utils.js`. Never use `date.toISOString().slice(0, 10)` for a day: it is UTC and shifts the date for users east or west of Greenwich (in India, every day before 05:30).
2. **`init` functions never render.** The router renders the visible page; rendering hidden pages at startup is wasted work.
3. **Only `app.js` listens to `data-changed` for re-rendering.** Pages must not add their own listener; they will be re-rendered when visible.
4. **One user action = one save.** If a handler needs to change several things, change them together and call `storage` once.
5. **Startup steps go through `runStep`.** A new startup step must not be able to take down the others.

### History
The issues originally listed here (double render on load, duplicate achievement checks, three "last 7 days" definitions, double save on preferences, demo data on first visit, all-or-nothing startup) were fixed together; see `DECISIONS.md` D-005 to D-010.

# CodeOrbit — Code Execution Flow

This document traces **how execution moves between files**: what runs first, in what order, and which function calls which. Read it alongside [`ARCHITECTURE.md`](ARCHITECTURE.md) (what the pieces are) and [`DECISIONS.md`](DECISIONS.md) (why they are that way).

> Function names are used instead of line numbers so this file does not go stale on every edit. If you rename or move a function listed here, update this file in the same PR.

**File names vs page names.** Some files and routes are older than the words on screen (D-020). They were kept so old links and bookmarks still work:

| Page people see | Route | File |
|---|---|---|
| Home | `#dashboard` | `dashboard.js` |
| Skills | `#skills` | `skills.js` |
| Study sessions | `#progress` | `progress.js` |
| Projects | `#projects` | `projects.js` |
| Goals | `#goals` | `goals.js` |
| Progress | `#analytics` | `analytics.js` |
| Badges (opened from Progress) | `#achievements` | `achievements.js` |
| Settings (opened from the profile picture) | `#settings` | `settings.js` |

In saved data, study sessions are `activities` and badges are `achievements`.

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
              ├─ starfield, dialogs, shortcuts, sound setting, offline support
              ├─ register 8 pages with the router
              ├─ init every page + the week in review (wire listeners only, no rendering)
              ├─ evaluateAchievements() once
              ├─ navigation.init()  → renders ONLY the page named in the URL hash
              └─ listen for 'codeorbit:data-changed'
   (every step runs in its own try/catch: one failure does not stop the rest)

After that, everything is driven by user events, and every data change follows ONE loop:

  user action → page handler → storage.saveX() → storage.saveUniverse()
             → localStorage write → dispatch 'codeorbit:data-changed'
             → the listener re-reads the sound setting, checks badges,
               then re-renders the visible page
```

---

## 2. Entry point

**`index.html`** is the only HTML page. Loading order:

| Order | What | How it loads | Result |
|---|---|---|---|
| 1 | CSS files (`style`, `components`, `dashboard`, `orbital`, `responsive`); fonts from `assets/fonts` | `<link>` in `<head>` | Styles ready before first paint |
| 2 | Chart.js 4.4.7 (jsDelivr, pinned + SRI hash) | classic `<script>` in `<head>`, blocking | Creates global `window.Chart` |
| 3 | Lucide 1.70.0 (jsDelivr, pinned + SRI hash) | classic `<script>` in `<head>`, blocking | Creates global `window.lucide` |
| 4 | `assets/js/app.js` | `<script type="module">` at the end of `<body>` | Module scripts are deferred: runs **after** the whole HTML is parsed |

If a CDN file does not match its `integrity` hash, the browser refuses to run it: `window.Chart` / `window.lucide` stay undefined, charts are skipped and icons stay as empty `<i>` tags, but the rest of the app still works.

All 8 pages already exist in the HTML as `<section class="view-page" id="view-…">`, and all dialogs as `.modal-backdrop` elements (the "Are you sure?" dialog is created by `components.js` the first time it is needed). JavaScript never creates pages; it only shows/hides them and fills them with data.

---

## 3. Phase 1: module import (before any page code runs)

When the browser runs `app.js`, it first resolves its `import` statements **depth-first**, in the order they are written. Each file is evaluated exactly once, no matter how many files import it. Code at the top level of a module runs during this phase.

Effective evaluation order:

1. **`navigation.js`**: creates the `navigation` singleton (`currentRoute = 'dashboard'`, empty page map).
2. **`icons.js`**: only defines the inline icon set.
3. **`utils.js`**: pure helper functions + the `sounds` singleton (`new SoundEffects()`; no audio context yet).
4. **`storage.js`**: creates the `storage` singleton. Its constructor calls `storage.init()` **immediately**:
   - reads `localStorage['codeorbit_universe_v1']`
   - **localStorage blocked?** → runs in memory with `getEmptyUniverse()` (nothing persists)
   - **empty (first visit)?** → `startFresh()` saves `getEmptyUniverse()`. Sample data ("Alex Rivera", `getSampleUniverse()`) is loaded **only** when the user asks: *Try it with sample data first* on Home, or Settings → Your data → Load sample data.
   - **unreadable?** (bad JSON, not an object, or `skills` is not an array) → copies the raw string to `codeorbit_universe_v1_corrupt_backup`, then `startFresh()`
   - **valid?** → keeps it in `storage.cache`
   - The first-visit save fires `codeorbit:data-changed`, but no one is listening yet, so nothing happens.
5. **`components.js`**: creates the `toast` singleton (its container is found or created on the first toast).
6. **`skills.js`, `progress.js`, `settings.js`, `recap.js`, `dashboard.js`, `projects.js`, `goals.js`, `achievements.js`**: only define functions and module-level state (filters, sort order). Nothing renders yet.
7. **`charts.js`**: creates the `chartManager` singleton (empty map of chart instances); then **`analytics.js`**.
8. **`app.js`** body runs: because the document is already parsed, `document.readyState !== 'loading'`, so it calls **`initApp()` directly**.

---

## 4. Phase 2: `initApp()` startup sequence (`app.js`)

Runs once, in this exact order. **Every step runs through `runStep(name, fn, failures)`**: if a step throws, the error is logged, its name is recorded, and the next step still runs. If anything failed, one `toast.error` at the end names the failed steps (in plain words, e.g. "skills page").

| Step | Call | What it does |
|---|---|---|
| 1 | `initStarfield()` *(app.js)* | Draws the background stars; starts a `requestAnimationFrame` loop unless the OS asks for reduced motion. |
| 2 | `setupModalDismissHandlers()` *(components.js)*, `setupGlobalShortcuts()` *(app.js)*, `syncSoundSetting()` *(app.js)* | **Esc** closes the open dialog and search; clicks on the backdrop / `[data-modal-close]` close dialogs. **Ctrl/Cmd+K** or **/** → `openCommandPalette()`; typing → `renderPaletteResults(query)`. `syncSoundSetting` copies `settings.soundEnabled` into `sounds.enabled`. |
| 3 | `registerServiceWorker()` *(app.js)* | Registers `sw.js` for offline use (https or localhost only; failure only means no offline support). |
| 4 | `navigation.registerView(route, fn)` ×8 | Maps `'dashboard' → renderDashboard`, `'skills' → renderSkills`, … `'settings' → renderSettings`. |
| 5 | `initDashboard()` … `initSettings()`, then `initRecap()` (9 calls, each its own step) | Each attaches its page's button/form/filter listeners. **None of them render** (see §5). `initSettings` also fills the profile picture in the top bar, because it is visible on every page. |
| 6 | `evaluateAchievements()` *(achievements.js)* | Unlocks badges already earned (e.g. data saved by an older version) **before** the first paint. No listener is registered yet, so its save causes no render. |
| 7 | `navigation.init()` | Attaches the top-bar link listeners, listens for `hashchange`, then `handleHashChange()` → `navigateTo(route)` → `renderCurrentView()`: **the only render during startup.** |
| 8 | `window.addEventListener('codeorbit:data-changed', …)` | The one re-render listener (see §6). |
| 9 | `refreshIcons()` | `lucide.createIcons()` replaces `<i data-lucide="…">` placeholders with SVG icons. |

---

## 5. What each page's `init` does

Every page module follows the same shape: **`initX()` attaches listeners only; `renderX()` draws the page and is called by the router** when the page is shown or when data changes while it is shown. Listeners only change module state or call `storage`. Home also opens other pages' dialogs (it imports `openSkillModal`, `openActivityModal`, `downloadBackup` and `openRecap`), but never draws another page.

| Module | `init` attaches | `render` reads | `render` calls |
|---|---|---|---|
| `dashboard.js` (Home) | *Add study time* → `openActivityModal`; *+30 min on …* → `quickAdd` / *Undo* → `undoQuickAdd`; backup reminder *Download backup* → `downloadBackup`, *Not now* → `saveSettings({ backupSnoozeUntil })`; first visit *Add your first skill* → `openSkillModal`, *Try it with sample data first* → `storage.loadSampleData()` | whole data set | nothing saved at all (no skills, sessions, projects or goals)? show `#home-empty` and stop; else `renderGreeting`, `renderWeek` (`isWithinLastNDays`, `calculateStreak`, `streakMessage`), `renderQuickAdd`, `renderOrbit` (DOM APIs, no `innerHTML`), `renderDays` (`getLastNDaysISO`), `renderComingUp` (+ the week-in-review row when `shouldOfferRecap`), `renderBackupReminder` (`backupReminder`) |
| `skills.js` | Search, category filter, status pills, sort, Add button, form submit, progress slider label | `skills` | per-card `+10%/−10%` → `stepSkillProgress`, ⋯ menu → `showSkillContextMenu` → edit (`openSkillModal`) / delete (`showConfirmDialog` → `storage.deleteSkill`) |
| `progress.js` (Study sessions) | Search, type filter, skill filter, sort, *Add study time* button, form submit | `activities`, `skills`, `settings` | `populateSkillFilterOptions`, `openActivityModal`, delete via `showConfirmDialog` |
| `projects.js` | Search, status pills, sort, Add button, form submit, progress slider label, "Tools used" input | `projects` | `renderModalTags`, `openProjectModal`, delete via `showConfirmDialog`; links through `safeUrl` |
| `goals.js` | Search, status pills, priority filter, Add button, form submit, progress slider label | `goals` | `toggleGoalComplete`, `openGoalModal`, delete via `showConfirmDialog` |
| `achievements.js` (Badges) | Group pills (no `data-changed` listener of its own) | `achievements` + `ACHIEVEMENT_DEFINITIONS` | (unlocking happens in `app.js`, see §6) |
| `analytics.js` (Progress) | *How is this worked out?* → `openModal('score-breakdown-modal')` | whole data set | `calculateProgressScore`, `populateScoreModal`, badges count, `calculateStreak`, 5 × `chartManager.render…Chart`, `generateHabitInsights` |
| `settings.js` | Section buttons, profile form, preferences form, profile pictures, *Download backup* (`downloadBackup`), *Restore from backup*, *Load sample data*, *Delete all my data*, *Install CodeOrbit on this device*; **fills the top-bar profile picture** | `profile`, `settings` | `updateTopbarProfile` |
| `recap.js` | *Last week in review* on Progress → `openRecap`; the goal form in the dialog → `saveSettings({ weeklyTargetHours })` | (dialog only) | `openRecap` fills the dialog from `weeklyRecap()` and saves `recapSeenFor` |

---

## 6. The data-change loop (the heart of the app)

Example: **user adds a skill.**

```
1. Click "Add a skill"          skills.js   → openSkillModal()      → components.openModal('skill-modal')
2. Fill form, press Save        skills.js   → handleSkillFormSubmit(e)
                                                ├─ reads + trims form fields, validates name
                                                ├─ progress 100 ⇒ status 'Completed'
                                                ├─ storage.saveSkill(skillData)
                                                ├─ closeModal('skill-modal')
                                                └─ toast.success(...)
3.                              storage.js  → saveSkill(skill)
                                                ├─ getUniverse()   (deep copy of cache)
                                                ├─ markAsOwnData()  (drops the sample-data mark, D-026)
                                                ├─ has id? update in place : generateId('sk_') + push
                                                └─ saveUniverse(data)            reason = 'edit'
4.                              storage.js  → saveUniverse(data, reason)
                                                ├─ this.cache = data
                                                ├─ localStorage.setItem(KEY, JSON.stringify(data))
                                                └─ dispatch 'codeorbit:data-changed' { timestamp, reason }  ← synchronous
5. One listener fires:
   app.js (startup step 8)      → syncSoundSetting()
                                → evaluateAchievements({ silent: reason === 'replace' })
                                     └─ unlocked something? → return (see below)
                                → navigation.renderCurrentView()   (error-contained)
                                → refreshIcons()
```

The same loop applies to every write: `saveActivity`, `saveProject`, `saveGoal`, `deleteX`, `saveProfile`, `saveSettings`, `unlockAchievements`, and the three that replace everything: `importJSON`, `resetAllData`, `loadSampleData`. Those three save with `reason = 'replace'`, so badges they unlock appear quietly, without "You earned a badge" pop-ups.

### When a badge unlocks inside the loop

```
app.js listener (outer round)
  └─ evaluateAchievements()            isEvaluating = true
       ├─ collect ALL newly satisfied definitions
       ├─ storage.unlockAchievements(ids)   ← ONE save for all of them
       │    └─ dispatch 'data-changed'  (synchronous, nested round)
       │         └─ app.js listener → evaluateAchievements() returns false (isEvaluating)
       │                            → renderCurrentView(), icons
       ├─ toast.achievement(...) for each new badge (skipped when silent)  → sounds.achievement()
       └─ return true
  └─ return early: the nested round already re-rendered everything
```

Result: one save that unlocks N badges = 2 `data-changed` events and **one** page render. The badge chime is the only sound in the app, and it is off when Settings → Sounds is off.

---

## 7. Navigation flow

```
Top-bar link click     → navigation.navigateTo(route)
                           └─ sets location.hash = '#route' and RETURNS
Browser fires hashchange → navigation.handleHashChange()
                           └─ unknown/empty hash ⇒ 'dashboard' (isRoute ignores inherited keys like #constructor)
                           └─ navigateTo(route, updateHash = false)
                                ├─ hide all .view-page, show #view-<route>
                                ├─ highlight the active .nav-link (Badges highlights Progress)
                                ├─ set the page title/subtitle from ROUTE_CONFIG (hidden on Home), document.title
                                ├─ renderCurrentView()  (registered render function, try/catch)
                                ├─ scroll to top
                                └─ lucide.createIcons()
```

Search results navigate the same way: they set `window.location.hash` directly and close search.

---

## 8. Other flows

**Search (Ctrl+K):** `openCommandPalette()` → clears input → `renderPaletteResults('')` → searches skills, projects, study sessions and goals in `storage.getUniverse()` → shows the first 10 matches (with the label helpers, e.g. "Finished", "Project work") → click → set hash → close.

**Download backup:** `downloadBackup()` *(settings.js; also used by Home's reminder)* → `handleExportJSON()` → `storage.exportJSON()` (pretty JSON) → `Blob` → temporary `<a download>` click → file `codeorbit-backup-YYYY-MM-DD.json` → `saveSettings({ lastBackupAt: now, backupSnoozeUntil: '' })`.

**Restore from backup:** file input `change` → `handleImportFile()` → `FileReader.readAsText` → `showConfirmDialog` → `storage.importJSON(text)` (checks the core lists, fills missing profile/settings from defaults, keeps this device's backup dates, sets `lastBackupAt`, drops malformed dates, clamps progress to 0–100 and durations to ≥ 1) → `saveUniverse(data, 'replace')` → data-change loop → `renderSettings()` → toast. A file that is not a backup gets one plain message ("This file is not a CodeOrbit backup…").

**Sample data / Delete all my data:** Settings: confirm dialog → `storage.loadSampleData()` / `storage.resetAllData()` → data-change loop (`'replace'`) → `renderSettings()`. On the first visit, *Try it with sample data first* calls `loadSampleData()` with no confirm dialog: Home only shows that button when nothing is saved, so nothing can be lost.

**Quick add (+30 min):** `quickAdd()` → `quickSkill()` picks the skill studied most recently (else the first skill) → `storage.saveActivity({ duration: 30, date: today, … })` → data-change loop → "Added 30 min on …" with *Undo* for 10 seconds (`undoQuickAdd` → `storage.deleteActivity(id)`).

**Backup reminder:** `renderBackupReminder()` → `backupReminder(settings, sessionCount)` *(utils.js)*: shown with 3+ sessions, not sample data, no backup in 30 days, not snoozed. *Not now* snoozes it for 7 days.

**Week in review:** `shouldOfferRecap(data)` → on Sundays and Mondays, when there is any study time in the last two weeks and `recapSeenFor` is not this week's Sunday, Home shows a row → `openRecap()` → `weeklyRecap(activities)` fills the dialog → saves `recapSeenFor`. The goal form saves `weeklyTargetHours` (1–80).

**Save preferences:** `handlePreferencesSubmit()` → `storage.saveSettings({ dailyTargetHours, weeklyTargetHours, soundEnabled })` (one data-change loop; the loop re-reads the sound setting).

**Offline and install:** `sw.js` caches `APP_FILES` and the two CDN scripts on install; every request goes to the network first and falls back to the cache when offline (D-024). Browsers that support installing fire `beforeinstallprompt`; `settings.js` then shows *Install CodeOrbit on this device*.

**Charts:** every `chartManager.render…Chart(canvasId, data)` first checks the canvas exists and `window.Chart` is loaded, calls `destroyChart(canvasId)` to free the old instance, builds a new `Chart`, and stores it in `chartManager.instances`.

---

## 9. Dependency map (who imports whom)

```
app.js ──► navigation, components, utils, storage, recap,
           dashboard, skills, progress, projects, goals, achievements, analytics, settings

dashboard.js ──► storage, utils, components, skills, progress, settings, recap
analytics.js ──► storage, utils, components, charts, achievements
achievements.js ──► storage, utils, components, icons
progress.js ──► storage, utils, components, icons
skills / projects / goals / settings / recap.js ──► storage, utils, components
components.js ──► storage, utils, icons
storage.js ──► utils
charts.js ──► utils (plus the global window.Chart)
navigation.js, utils.js, icons.js ──► (none)
```

`utils.js`, `icons.js` and `navigation.js` are leaves; `storage.js` is the only module that touches `localStorage`. There are no import cycles. Pages talk to each other only through `storage` and the `data-changed` event; the only page-to-page imports are Home opening other pages' dialogs (`dashboard.js`) and Progress reading the badge list (`analytics.js`).

---

## 10. Rules that keep this flow correct

1. **Calendar days are local, never UTC.** Use `getTodayISO()`, `getRelativeISO(n)`, `toLocalISO(date)`, `getLastNDaysISO(n)` and `isWithinLastNDays(dateStr, n)` from `utils.js`. Never use `date.toISOString().slice(0, 10)` for a day: it is UTC and shifts the date for users east or west of Greenwich (in India, every day before 05:30).
2. **`init` functions never render.** The router renders the visible page; rendering hidden pages at startup is wasted work.
3. **Only `app.js` listens to `data-changed` for re-rendering.** Pages must not add their own listener; they will be re-rendered when visible.
4. **One user action = one save.** If a handler needs to change several things, change them together and call `storage` once.
5. **Startup steps go through `runStep`.** A new startup step must not be able to take down the others.
6. **Saved text goes through `escapeHTML`, saved links through `safeUrl`.** A backup file is untrusted input.

### History
The issues originally listed here (double render on load, duplicate badge checks, three "last 7 days" definitions, double save on preferences, demo data on first visit, all-or-nothing startup) were fixed together; see `DECISIONS.md` D-005 to D-010.

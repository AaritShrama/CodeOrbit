# CodeOrbit — Decision Log

Every meaningful technical decision, **why** it was made, and **what we gave up** to make it.

Code shows *what* we built. This file records *why*, so future contributors don't undo a decision without knowing what it was protecting, or keep a bad one because nobody remembers why it exists.

**Rules**
- Add an entry in the **same PR** as the change it describes.
- Never delete an entry. If a decision is reversed, add a new entry and mark the old one `Superseded by D-0XX`.
- Write the trade-off honestly. "No downsides" is almost never true.
- Statuses: `Proposed` → `Accepted` → (`Superseded` | `Deprecated`).

Execution flow is documented separately in [`FLOW.md`](FLOW.md).

---

## Part A: Decisions made during changes

### D-001: Keep policy files only in the repository root
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** `CONTRIBUTING.md`, `SECURITY.md` and `CODE_OF_CONDUCT.md` existed both in the root and in `docs/`. The copies matched except for relative link paths.
- **Decision:** Delete the `docs/` copies; keep the root copies.
- **Why:**
  - GitHub looks for community health files in `.github/`, then the root, then `docs/`, and uses the first one it finds. The root copies were already the ones shown in the repo's Contributing/Security links, so the `docs/` copies were never seen; they could only drift out of date.
  - The root is where contributors look first.
- **Trade-off accepted:** `docs/` no longer holds *every* document in one place.
- **Alternatives rejected:** Keeping both with a "mirror" note: two files to update on every change, and they had already started to diverge (one carried an extra note the other didn't).

### D-002: Use an absolute URL for the Contributing link in the PR template
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** `.github/PULL_REQUEST_TEMPLATE.md` linked to `CONTRIBUTING.md` with a relative path.
- **Decision:** Link to `https://github.com/LetsCook-Organization/CodeOrbit/blob/main/CONTRIBUTING.md`.
- **Why:** A PR template's text is copied into each PR description. Relative links there resolve against the PR page (`/pull/N`), not the template file, so any relative path returns 404.
- **Trade-off accepted:** The URL hard-codes the org, repo name and `main` branch. Renaming the default branch will break it (repo renames are redirected by GitHub).
- **Alternatives rejected:** Removing the link (contributors lose the pointer to the rules).

### D-003: Document execution flow and decisions in `docs/`, describe bugs before fixing them
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** The codebase had no record of *why* things were built this way, and no map of how execution moves between its 14 JS modules.
- **Decision:**
  1. Add `docs/DECISIONS.md` (this file) and `docs/FLOW.md`, next to `ARCHITECTURE.md`.
  2. `FLOW.md` references **function names, not line numbers**.
  3. Behaviour problems found while tracing (double renders, three different "last 7 days" calculations, double saves) are **documented in `FLOW.md` §10, not fixed in the same PR**.
- **Why:**
  - Line numbers change on almost every edit; function names rarely do.
  - Keeping docs-only PRs separate from behaviour changes keeps each PR small enough to review, and lets each bug get its own issue, test and discussion.
- **Trade-off accepted:** Readers must search for a function instead of jumping to a line. Known bugs stay live a little longer.

### D-004: Deployment target: keep Render, remove the GitHub Pages workflow
- **Date:** 2026-11-07 · **Status:** Accepted (option A)
- **Context:** The live site runs on Render, but `.github/workflows/deploy.yml` deploys to GitHub Pages, which is not enabled. The workflow has failed on every run, and four Dependabot PRs exist only to update that workflow's actions.
- **Options:**
  - **A. Keep Render:** delete `deploy.yml`, close the Dependabot PRs for it. *Cost:* deploys depend on a third-party account outside the GitHub org.
  - **B. Move to GitHub Pages:** enable Pages, keep the workflow, update README links. *Cost:* the public URL changes.
- **Decision:** A. Delete `.github/workflows/deploy.yml`; close Dependabot PRs #1–#4, which only updated that workflow.
- **Why:** The site is already live on Render (`codeorbit-c7q4.onrender.com`) and Render deploys automatically on every push to `main`. The Pages workflow never succeeded, and its red ❌ on every commit made the repo look broken to contributors.
- **Trade-off accepted:** Deploys depend on a Render account outside the GitHub org; whoever owns it must keep access.
- **Note:** `.github/dependabot.yml` is kept. It watches GitHub Actions and will cover the CI workflow added later.

### D-005: Render only the visible page; `init` functions only wire listeners
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** Every page's `initX()` rendered its page, then the router rendered the visible page again. Measured in Chrome: **9 chart builds on startup** while the dashboard shows 2.
- **Decision:** `initX()` attaches listeners only. The router renders a page when it becomes visible (it already did this on every navigation). `initSettings` still fills the sidebar profile card, the one shared element a page module owns.
- **Why:** Hidden pages are re-rendered anyway when opened, so rendering them at startup was pure waste. Measured after: **2 chart builds**.
- **Trade-off accepted:** The first visit to each page renders on click instead of being ready in advance. With localStorage data this is instant; it would matter only with slow data sources.
- **Alternatives rejected:** Skipping the router's render instead: then navigating to a page would show stale data.

### D-006: One `data-changed` listener for re-rendering; batch achievement unlocks
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** `achievements.js` and `app.js` both listened to `data-changed` and both evaluated achievements. Each unlock was a separate save, and each save re-rendered the page.
- **Decision:**
  1. Remove the listener in `achievements.js`; `app.js` owns evaluation and re-rendering.
  2. `storage.unlockAchievements(ids)` saves every new unlock in **one** write.
  3. `evaluateAchievements()` returns `true` when it saved; the outer listener then returns early, because the nested synchronous `data-changed` round already re-rendered.
- **Why:** One place to reason about re-renders. Measured: adding a skill that unlocks a badge now rebuilds the dashboard charts once (was twice).
- **Trade-off accepted:** The early-return relies on `dispatchEvent` being synchronous and on the `isEvaluating` guard. Both are documented in `FLOW.md` §6, and a comment in `app.js` explains it.
- **Alternatives rejected:** Debouncing renders with `requestAnimationFrame`: fewer renders, but the UI would briefly show stale data and tests would need to wait a frame.

### D-007: One definition of "last N days": local calendar days
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** Four different calculations existed: local dates (score), UTC dates (dashboard), rolling `now − N×24h` against UTC-parsed date strings (analytics, mission logs), and UTC day keys built from local midnight (both charts). Measured in Chrome at 02:00 IST: dashboard said **11h** this week, analytics said **13h**, and the weekly chart put Saturday's session under Sunday and a previous Sunday's session under Monday.
- **Decision:** Add `toLocalISO`, `getLastNDaysISO` and `isWithinLastNDays` to `utils.js`. "Last 7 days" = today plus the 6 previous **local calendar days**. Every screen and chart uses these helpers.
- **Why:** Users think in calendar days where they live, and activity dates are stored as plain `YYYY-MM-DD` with no timezone. Measured after: dashboard and analytics both say **3h**; chart bars sit on the right days.
- **Trade-off accepted:** If a user travels across timezones, "today" follows the device clock, so a session can appear on a different day than where it happened. Acceptable for a personal tracker.
- **Alternatives rejected:** Storing UTC timestamps: needs a data migration and still has to be converted to local days for display.

### D-008: Save preferences once
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** Saving the preferences form wrote all settings, then `applyTheme(theme)` wrote the theme again: two data-change loops per click.
- **Decision:** Call `applyTheme(theme, false)` after `saveSettings`, since the theme is already in the saved settings.
- **Why:** Rule: one user action = one save. Measured: 2 → 1 `data-changed` event.
- **Trade-off accepted:** None found.

### D-009: New users start with an empty universe; demo data is opt-in; unreadable data is kept
- **Date:** 2026-11-07 · **Status:** Accepted · Supersedes B-008
- **Context:** First visits loaded a fake user ("Alex Rivera") with 6 skills and 5 sessions, which immediately unlocked **6 of 10 achievements** the real user never earned. Unreadable stored data was silently overwritten with the same demo data.
- **Decision:**
  1. First visit → `getEmptyUniverse()`. Demo data loads only from Settings → Load Demo Universe (the button already existed).
  2. Unreadable data is copied to `codeorbit_universe_v1_corrupt_backup` before starting fresh.
  3. If `localStorage` is blocked, run in memory instead of crashing.
  4. `importJSON` fills a missing profile/settings from the blank defaults, not the demo user.
- **Why:** A progress tracker that starts with someone else's progress and unearned badges misrepresents the user's data, which is the core of the product. Losing a user's data without a copy is worse than showing an empty screen.
- **Trade-off accepted:** First-time visitors to the live demo now see empty screens instead of a full dashboard, which is less impressive at first glance. Every screen already has an empty state, and the demo is one click away. Visitors who already have demo data stored keep it (no migration), so old browsers are unaffected.
- **Alternatives rejected:** A `?demo` URL parameter: adds a second entry path to maintain; can be added later if the README demo link needs it.

### D-010: Startup steps are isolated; render errors are contained
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** `initApp()` ran every step inside one `try/catch`. Simulated in Chrome: if the Goals page's init throws, **navigation never initialises** and the whole app is dead with no visible error.
- **Decision:** Each startup step runs through `runStep()`, which logs and records failures and continues. One `toast.error` names the failed steps. `navigation.renderCurrentView()` renders with its own error boundary and is used by both navigation and the data-change listener (replacing an 8-branch `if/else` in `app.js`).
- **Why:** A broken page should cost that page, not the app. Measured after: with Goals broken, navigation still works and the user sees which part failed.
- **Trade-off accepted:** A partially broken app keeps running, so a bug can look less urgent than a blank screen. The error toast and console log keep it visible.

---

## Part B: Inherited decisions (reconstructed)

These choices were made before this log existed. **The original reasons were not written down.** The "Likely why" lines are inferred from the code and should be confirmed or corrected by the original authors. The trade-offs are facts about the current code.

### B-001: Vanilla HTML/CSS/JS, no framework, no build step
- **Likely why:** Anyone can contribute by opening `index.html` with Live Server; no Node toolchain to install; deploys as plain static files.
- **Trade-off:** Every page manages the DOM by hand. Pages re-render fully with `innerHTML` templates instead of updating only what changed, and every template must remember to escape user input (see B-007).

### B-002: All data in `localStorage`, as one JSON object under one key
- **Key:** `codeorbit_universe_v1`, holding `profile`, `settings`, `skills`, `activities`, `projects`, `goals`, `achievements`.
- **Likely why:** No backend, no accounts, no cost; data never leaves the user's browser.
- **Trade-offs:**
  - Data exists in **one browser on one device**. Clearing site data deletes it; the only backup is manual JSON export.
  - Browsers cap `localStorage` at roughly 5 MB per site.
  - Every save re-serialises and rewrites the **entire** object.
  - A `version` field exists (`DATA_VERSION = 1`), but there is **no migration code** yet. A future schema change must add one.

### B-003: Pages communicate only through `storage` + a `codeorbit:data-changed` event
- **Status:** Still in force; the re-render rules around it were tightened in D-005 and D-006
- **Likely why:** Page modules stay independent (none imports another). Any write anywhere refreshes whatever is on screen.
- **Trade-offs:** The event says only "something changed", so listeners re-render whole pages. Dispatch is synchronous, so a save inside a listener (achievement unlocks) triggers a nested round of re-renders (see `FLOW.md` §6).

### B-004: Hash-based routing (`#skills`, `#goals`, …)
- **Likely why:** Works on any static host without server rewrite rules; back/forward buttons work for free.
- **Trade-off:** URLs contain `#`; all 8 pages live in one HTML file (1,400+ lines).

### B-005: Chart.js 4.4.7 from the jsDelivr CDN
- **Likely why:** Mature, well-documented, canvas-based, handles bar/line/doughnut charts with theming, and needs no bundler.
- **Trade-offs:** The app depends on jsDelivr being reachable; if the script is blocked, `chartManager` silently skips charts. Loaded **without a Subresource Integrity (`integrity`) hash**, so a tampered CDN file would run with full page access.

### B-006: Lucide icons from unpkg, version `@latest`
- **Likely why:** Large consistent icon set, swapped in at runtime via `lucide.createIcons()`.
- **Trade-offs:** `@latest` means any new upstream release, including a breaking or malicious one, is loaded automatically with no review. No SRI hash. **Open issue: pin the version and add SRI.**

### B-007: Escape user text, then render with `innerHTML`
- **Likely why:** Template strings are the shortest way to build cards and lists without a framework; `escapeHTML()` in `utils.js` neutralises `<`, `>`, `&`, quotes.
- **Trade-off:** Safety depends on **every** template remembering to call `escapeHTML()` on every user-supplied field. One missed call is a stored XSS bug. A framework or `textContent`-based rendering would make that impossible by default.

### B-008: Pre-fill demo data ("Alex Rivera") on first visit
- **Status:** Superseded by D-009
- **Likely why:** A new visitor immediately sees a full, impressive dashboard instead of empty screens.
- **Trade-offs:** Real users start with someone else's data and must find "Reset" in Settings; achievements unlock from fake activity on first load. **Open issue: start empty and offer a "Load demo" button.**

### B-009: UI sounds generated with the Web Audio API
- **Likely why:** No audio files to ship or license; tones are synthesised in code and can be turned off in Settings.
- **Trade-off:** Browsers block audio until the first user interaction, so the earliest sounds may be silent.

### B-010: MIT license
- **Likely why:** Most permissive common license; lowest barrier for students and companies to use or fork.
- **Trade-off:** Anyone can reuse the code commercially, closed-source, without contributing back.

---

## Template for new entries

```markdown
### D-0XX: <short title>
- **Date:** YYYY-MM-DD · **Status:** Proposed | Accepted | Superseded by D-0YY
- **Context:** What situation forced a choice?
- **Decision:** What we chose, in one or two sentences.
- **Why:** The reasons. Link evidence (issues, benchmarks, docs) where possible.
- **Trade-off accepted:** What this costs us. Be specific.
- **Alternatives rejected:** What else we considered and why it lost.
```

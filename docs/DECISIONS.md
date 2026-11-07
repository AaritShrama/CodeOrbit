# CodeOrbit — Decision Log

Every meaningful technical decision, **why** it was made, and **what we gave up** to make it.

Code shows *what* we built. This file records *why*, so future contributors don't undo a decision without knowing what it was protecting, or keep a bad one because nobody remembers why it exists.

**Rules**
- Add an entry in the **same PR** as the change it describes.
- Never delete an entry. If a decision is reversed, add a new entry and mark the old one `Superseded by D-0XX`.
- Write the trade-off honestly. "No downsides" is almost never true.
- Statuses: `Proposed` → `Accepted` → (`Superseded` | `Deprecated`).

Execution flow is documented separately in [`FLOW.md`](FLOW.md).

**Names that changed since older entries were written.** Entries are history, so they keep the names used at the time. Today's names:

| Older entries say | Now |
| :--- | :--- |
| `loadDemoUniverse()`, `getDefaultUniverse()`, "Load Demo Universe" | `loadSampleData()`, `getSampleUniverse()`, Settings → Your data → *Load sample data* (or *Try it with sample data first* on the first visit) |
| "Reset All Data", "Export / Import JSON Backup" | *Delete all my data*, *Download backup* / *Restore from backup* |
| `calculateProductivityScore`, "productivity score" | `calculateProgressScore`, "progress score" |
| `keepCurrentTheme()`, `applyTheme()` | `keepDeviceSettings()`; `applyTheme` was removed with the light theme (D-025) |
| Sidebar, dashboard, Mission Logs, Analytics, Achievements | Top bar, Home, Study sessions, Progress, Badges (D-020, D-022) |
| `--cyan-accent`, `--orbital-orange` and other old colour names | `--text-primary`, `--accent-text`, … (D-026) |

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
- **Date:** 2026-11-07 · **Status:** Superseded by D-012
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
- **Date:** 2026-11-07 · **Status:** Superseded by D-025 (the theme and `applyTheme` are gone; preferences are still saved with one `saveSettings` call)
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

### D-011: Pin CDN scripts to exact versions with Subresource Integrity hashes
- **Date:** 2026-11-07 · **Status:** Accepted · Supersedes B-006, amends B-005
- **Context:** Lucide loaded as `lucide@latest` from unpkg, so any new release ran on every visitor's page unreviewed. Neither script had an `integrity` hash. Chart.js was requested as `chart.umd.min.js`, a file that **does not exist in the Chart.js 4.4.7 npm package**; jsDelivr generated it on the fly, so its bytes (and any hash of them) were not guaranteed to stay the same.
- **Decision:**
  1. Pin Lucide to **1.70.0**, the version `@latest` resolved to on this date, so live behaviour does not change.
  2. Load both libraries from **jsDelivr** (Lucide moved off unpkg).
  3. Load Chart.js from the real file `dist/chart.umd.js` (already minified, 205,615 bytes).
  4. Add `integrity="sha384-…"`, `crossorigin="anonymous"` and `referrerpolicy="no-referrer"` to both.
- **Why:**
  - An `integrity` hash makes the browser refuse a CDN file that differs from the reviewed one, so a compromised or changed CDN cannot run code on the site.
  - Hashes were computed from the npm tarballs **and** checked against the bytes jsDelivr actually serves; both matched exactly.
  - Before pinning, all 34 icon names used in `index.html` and `assets/js/` were checked to exist in Lucide 1.70.0.
  - One CDN means one fewer third party that can fail or be compromised.
- **Trade-off accepted:**
  - Upgrading a library is now a deliberate manual change (new version **and** new hash). That is the intent.
  - Both libraries now depend on jsDelivr alone. If jsDelivr is down, charts and icons are missing (the rest of the app still works).
  - Google Fonts CSS is **not** hashed: Google serves different CSS per browser, so SRI cannot be used there. Its failure mode is only a fallback font.
- **Alternatives rejected:** Self-hosting both files in `assets/vendor/`: removes the CDN dependency entirely, but adds ~690 KB of third-party code to the repo and every upgrade becomes a file copy. Worth reconsidering if a CDN outage ever bites.

**Updating CDN libraries (how-to):**
1. Pick the exact version, e.g. `lucide@1.71.0`, and the exact file path that exists in the npm package (`npm pack lucide@1.71.0`, then look inside `package/dist/`). Never use `.min.js` names that the package does not ship.
2. Compute the hash: `curl -sL <url> | openssl dgst -sha384 -binary | openssl base64 -A`, then prefix it with `sha384-`.
3. Update `src` and `integrity` in `index.html`, open the app, and check that the console shows no integrity errors and icons/charts render.
4. Add a decision entry if the upgrade changes behaviour.

### D-012: Host on GitHub Pages under the LetsCook-Organization org (replaces Render)
- **Date:** 2026-11-07 · **Status:** Accepted · Supersedes D-004
- **Context:** After D-004 it turned out the Render service was created from a contributor's **personal** Render account and connected to a personal copy of the repo, not to `LetsCook-Organization/CodeOrbit`. None of the org repo's pushes deployed: the live site stayed on the morning's version (demo data, date bugs, unpinned scripts) while `main` moved on. The risk D-004 accepted ("deploys depend on an account outside the GitHub org") had already happened.
- **Decision:** Deploy with GitHub Pages from this repo via `.github/workflows/deploy-pages.yml` on every push to `main`. Live URL: `https://letscook-organization.github.io/CodeOrbit/`. The personal Render service is to be suspended by its owner.
- **Why:**
  - The org owns the repo, the deploy, and the URL. No personal account can silently stop deployments or serve a different version.
  - Free, HTTPS, no extra account, and the deploy status is visible as a check on every commit.
  - The app is a static site with only relative paths, so it works unchanged under the `/CodeOrbit/` sub-path.
- **How the workflow is hardened:** actions pinned to full commit SHAs (version in a comment; Dependabot updates them), least-privilege `permissions`, `persist-credentials: false`, a 10-minute timeout, and no cancelling a deploy halfway.
- **Trade-off accepted:**
  - The public URL changes. Anyone holding the old Render link needs the new one (or the Render service could serve a redirect page until it is retired).
  - The URL is a `github.io` sub-path, not a custom domain. A custom domain (e.g. a subdomain of `letscook.co.in`) can be added later in Settings → Pages without code changes.
  - The whole repository (docs included, hidden folders excluded) is published, since there is no build step. All of it is already public on GitHub.
- **Alternatives rejected:** A new Render account owned by Let's Cook: works, but adds a second service and login to manage for a static site that GitHub can host for free.

### D-013: Version as 0.1.0 (pre-1.0), keep a changelog, describe only what exists
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** The app, README, ARCHITECTURE and SECURITY all said **1.0.0**, and the README said every feature was "fully implemented". On the same day the app had six flow bugs, a date bug affecting every user in India, fake demo data on first visit, no tests, no lint, no data migrations, and no release history. Other claims were also untrue: "zero-dependency" (it loads two CDN libraries), a "migration engine" in `storage.js` (none exists), and an ASCII mock-up presented as an "Application Preview".
- **Decision:**
  1. Version **0.1.0**, following Semantic Versioning: below 1.0.0, features and the stored data format may still change.
  2. Add `CHANGELOG.md` (Keep a Changelog format) and tag `v0.1.0`.
  3. Rewrite claims to match the code: remove "fully implemented", "zero-dependency" and "migration engine"; label the ASCII preview as illustrative.
  4. Replace the all-ticked roadmap with **Shipped / Next (v0.2.0) / Later**, listing real gaps (lint, tests, migrations, onboarding, screenshots, accessibility, GitHub import, sync).
  5. SECURITY.md supports **latest `main`** instead of a `1.0.x` line that does not exist.
- **Why:**
  - Contributors decide whether to join by reading the README. "1.0, fully implemented" signals there is nothing to do; an honest roadmap gives them concrete work.
  - Calling it 1.0 promises a stable data format. With no migration code, the next schema change would break existing users' data; a 0.x version is honest about that risk.
  - Reviewers (GSoC mentors, judges, employers) check claims against code. One false claim makes every other claim suspect.
  - Keeping SECURITY's old table would have marked the real current version as "Unsupported".
- **Trade-off accepted:** "v0.1.0" looks less finished than "v1.0.0" at first glance. Every new user-visible change now needs a changelog line (enforced by a PR-template checkbox).
- **Alternatives rejected:** Keeping 1.0.0 and only fixing the wording: the version number itself is the biggest claim of stability.

### D-014: ESLint + Prettier, checked in CI, and deploy only after checks pass
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** No linter, no formatter, no automated check of any kind. Since D-012, every push to `main` deploys to the live site within a minute, and outside contributors will soon send pull requests from different editors.
- **Decision:**
  1. **ESLint 10** (flat config, `eslint.config.js`) with `recommended` plus bug-catching rules only: unused/undefined variables, accidental globals, shadowing, `eqeqeq`, `prefer-const`, `consistent-return`, no `eval`. No stylistic rules.
  2. **Prettier 3** owns formatting, configured to match the existing style (single quotes, semicolons, 2 spaces, no trailing commas, 100 columns). It formats **JS, CSS, JSON and YAML only**.
  3. One workflow, `.github/workflows/ci.yml`: job `check` runs on every PR and push; job `deploy` runs **only on pushes to `main` and only if `check` passed** (`needs: check`). Replaces `deploy-pages.yml`.
  4. Tools are exact-pinned in `package.json` + `package-lock.json`, installed with `npm ci --ignore-scripts`; Dependabot updates them monthly as one grouped PR.
  5. The one-time reformat is a separate commit listed in `.git-blame-ignore-revs`.
- **Why:**
  - Turning ESLint on found **13 real problems** in code that looked fine: unused imports, an unused variable, values assigned and never read, and a skills "proficiency" filter that could never activate because nothing set it.
  - Formatting arguments in code review waste beginners' time; an automatic formatter ends them.
  - Making deploy depend on checks means a push that fails lint never reaches the live site.
  - HTML is excluded because Prettier can change whitespace between inline elements, which is visible in the UI; Markdown is excluded so hand-written docs stay as written.
  - The reformat was verified by comparing the parsed syntax tree of every JS file before and after: only two object keys lost redundant quotes.
- **Trade-off accepted:**
  - The repo now has a `package.json`, a lockfile and three config files, after advertising "no npm". The app itself still needs **no install and no build**; `package.json` is `private` with devDependencies only, and deploy strips these files from the published site.
  - Contributors who want to run checks locally need Node.js 20+. Those who don't will see the result on their PR instead.
  - A one-time 1,400-line formatting diff; `git blame` skips it via `.git-blame-ignore-revs`.
  - CI only checks code quality, not behaviour. Behaviour tests are the next step.
- **Alternatives rejected:** Running checks in a separate workflow and deploying via `workflow_run`: harder to read, and a failed check would not visibly block the deploy on the same commit.

### D-015: Unit tests with Node's built-in runner, repeated in four timezones; empty universe scores 0
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** Lint and format checks (D-014) catch sloppy code, not wrong answers. The core logic (local dates, streaks, the productivity score, storage, import validation, achievement rules) had no tests, and that day alone it had shipped a timezone bug, fake badges and a double-counting score. While planning the tests, one more bug was found: `calculateProductivityScore` gave **20/100 to a brand-new user with nothing logged**, because "no projects" and "no skills" each counted as a neutral 10/20.
- **Decision:**
  1. **52 unit tests** in `tests/` using **`node:test`** and `node:assert` (built into Node, no test library).
  2. **`npm test` runs them once per timezone:** Asia/Kolkata, UTC, America/Los_Angeles (DST change on 1 Nov 2026) and Pacific/Kiritimati (UTC+14), via `scripts/test.mjs` so it works the same on Windows.
  3. Date tests **freeze the clock** (`node:test` mock timers) at exact moments, e.g. 02:00 IST, a leap day, the US DST change.
  4. Browser APIs the modules need at import (`localStorage`, `window` events) are provided by a small stand-in, `tests/helpers/browser-globals.js`, loaded with `node --import`. No jsdom.
  5. CI gets a separate **`Unit tests`** job; deploy needs both it and `Lint & format`. The existing job name is kept because the branch ruleset requires it by name.
  6. **Score fix:** the neutral 10/20 for having no projects/skills applies only after the user has logged at least one session. An empty universe scores 0.
- **Why:**
  - **Proof the tests guard the fixes:** reintroducing three of the day's bugs one at a time made the suite fail each time: the UTC date bug (13 failures across the timezone runs), the 20/100 empty score (4), demo data on first visit (44). With the fixes restored: 0.
  - A date bug is invisible in UTC, which is what CI machines use. Running every test in four zones is the only way CI sees what users in India see.
  - `node:test` keeps the "no heavy tooling" spirit: nothing new to install or learn.
  - Score: a progress tracker that rewards doing nothing undermines the number's meaning.
- **Trade-off accepted:**
  - Tests cover pure logic and storage only. Page modules (DOM rendering, forms) are untested; browser end-to-end tests would need Playwright and a browser in CI, a much heavier step, left for later.
  - The browser stand-ins are simpler than real browsers (e.g. no storage quota), so storage edge cases around quotas are not covered.
  - Running four timezones makes `npm test` four times slower (still a few seconds); `npm run test:quick` runs one.
  - Score fix: a user with skills or projects but **no sessions** now gets only what those earn (e.g. 20/100 for 50% on both) instead of an extra free baseline.
- **Alternatives rejected:** Jest or Vitest: popular, but add a dependency tree and config, and Jest's ESM support needs extra setup for this codebase's native modules.

### D-016: Seed the issue tracker; all issues open to everyone; one good first issue per person
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** README and CONTRIBUTING told contributors to look for `good first issue`, but the repository had **no issues at all**. A newcomer arriving from a community post found nothing to pick up.
- **Decision:**
  1. Open **13 issues** (#8–#20) from gaps found while reviewing the code: 6 `good first issue`, 6 medium, 1 hard. Each names the files to change, gives steps and a "Done when" checklist.
  2. Add labels for area (`tests`, `data`, `dates & timezones`, `accessibility`) and size (`difficulty: easy/medium/hard`).
  3. **All issues are open to everyone**; none reserved for maintainers' own community.
  4. **One `good first issue` per person**, claim by comment, reassign after 14 days without activity (CONTRIBUTING → "Picking an Issue").
  5. **Hard issues are design-first:** discussion in comments before code.
- **Why:**
  - Specific issues with a definition of done get better PRs and fewer review rounds than vague ideas.
  - Every issue was checked against the code before posting. One planned issue (missing `aria-label`s on icon buttons) was **dropped** because all 68 buttons already had labels, and checking turned up three **new real bugs** (#8 deadlines, #9 peak weekday, #10 import duration), reproduced with the timezone set to India and US West.
  - Reserving issues for insiders discourages outside contributors, and an open-source project grows from outsiders. The one-per-person rule protects beginners without gatekeeping.
- **Trade-off accepted:** Maintainers must answer claims and review PRs quickly or contributors leave; 14-day reassignment means some work is abandoned midway. The `good first issue` pool will run out fast and needs refilling.
- **Alternatives rejected:** Reserving issues for Let's Cook members first: easier onboarding for the community, but signals the project is not really open.

### D-017: README rewritten in plain language, with Let's Cook branding and generated, animated graphics
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** The README mixed marketing language ("telemetry", "flightpaths", "data sovereignty") with a long technical tree, did not explain the issues or how to start contributing, and did not carry the Let's Cook identity.
- **Decision:**
  1. **Plain language first:** short sentences, every space-themed name translated ("Mission Logs = your study sessions"), numbered sections 00–12 in a Swiss layout, FAQ in collapsible blocks.
  2. Sections for the problem, the solution, features, how it works, trying it, how the code is organised, **all open issues by difficulty**, a step-by-step first contribution, how quality is checked, roadmap and FAQ.
  3. **Brand:** Let's Cook black / white / crimson `#B8002F`, the official logo in light- and dark-mode versions (`<picture>`), and the motto *Codere, Aedificare, Vincere*.
  4. **Graphics are generated** by `.github/readme/src/build.py` into SVGs: text converted to shapes (Inter, JetBrains Mono) so they look identical everywhere; **only looping motion** (orbits, twinkling stars, a travelling dot, flowing arrows); **no fade-in of text**; motion turned off for `prefers-reduced-motion`.
  5. Assets live in `.github/readme/`, which is not published to the live site.
- **Why:**
  - Many readers are students reading in a second language; simple English helps every one of them and costs experts nothing.
  - A first version faded text in. In a full-page capture, text below the fold stayed **invisible**, because animations had not started. Any viewer that shows only the first frame (some previews, apps, screenshots) would show empty cards, so fade-ins were removed.
  - Every claim was checked against the code: e.g. "no analytics" instead of "no tracking", because the app loads fonts and libraries from Google Fonts and jsDelivr.
- **Trade-off accepted:**
  - The issue table in the README is a snapshot of v0.1.0 and will go stale; it links to the live issue list and says so.
  - Graphics with text-as-shapes are larger (≈100–150 KB each) and cannot be edited by hand; changes go through `build.py`.
  - The hero banner shows `v0.1.0`; rebuild it when the version changes.
- **Alternatives rejected:** Plain Markdown with no images: lighter, but does not carry the project's identity. Raster (PNG/GIF) banners: no crisp scaling and a GIF cannot respect reduced-motion settings.

### D-018: Never echo raw input into HTML; drop malformed dates on import
- **Date:** 2026-11-07 · **Status:** Accepted · Amends B-007
- **Context:** An open-source readiness audit tested a deliberately malicious backup file (an HTML/JS payload in every field) in Chrome across all 8 pages. **6 payloads executed**: `formatDate()` returned an invalid date string unchanged and its result is inserted with `innerHTML` (activity dates, goal deadlines, skill and project target dates, achievement unlock times), and Analytics printed the top skill name unescaped. A dashboard project status was also unescaped. All other fields were already escaped, and `javascript:` links were already blocked *(correction, 2026-11-08: they were not. The test file used the wrong field names, `github`/`demo` instead of `githubUrl`/`liveDemoUrl`, so project links were never tested; a `javascript:` link from a backup file was rendered and would run when clicked. Fixed with `safeUrl()`, see D-026)*. Risk: anyone importing a backup shared by someone else. The live site shares an origin (`letscook-organization.github.io`) with every other Pages site of the org, so script running there could read their `localStorage` too.
- **Decision:**
  1. `formatDate()` (and so `formatRelativeTime()`) returns `'N/A'` or `'Invalid date'`, **never its input**.
  2. Escape the remaining user-controlled values (top skill name, project status, date-group label).
  3. `importJSON` keeps only well-formed dates (`YYYY-MM-DD`, optionally with time): bad optional dates become empty, sessions and achievements without a valid date are dropped.
  4. Regression tests for both; the browser check re-run: **0 payloads executed**, both with poisoned stored data and through the real Settings → Import flow.
- **Why:** Two layers: even if one escaping call is forgotten in a future template, malformed data should not get into storage from an import, and vice versa.
- **Trade-off accepted:** A backup containing sessions with missing or malformed dates loses those sessions on import (the app itself never creates such sessions). The rule in B-007 still depends on every new template escaping user text; the security tests only cover the fields that exist today.
- **Disclosure:** fixed the same day it was found, before any public report; noted in the CHANGELOG under *Security*.

### D-019: Force the patched `minimatch` inside ESLint with an npm override
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** Dependabot reported [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) (moderate, denial of service) in `minimatch` < 11.0.1, used by ESLint 10 (`@eslint/config-array` asks for `^10.2.4`, which has no patched release). `npm audit fix --force` proposed **downgrading** ESLint to 9.
- **Decision:** Add `"overrides": { "minimatch": "11.0.5" }` to `package.json`.
- **Why:** The risk to users was zero: ESLint is a development tool that never ships to the live site, and the patterns it matches are written by us. But an open alert trains people to ignore alerts. The override closes it without downgrading the linter. Verified: `npm audit` reports 0 vulnerabilities, ESLint still reports planted errors, and its ignore patterns (`docs/`, `*.min.js`) still work.
- **Trade-off accepted:** ESLint officially supports minimatch 10, not 11. If a future ESLint update breaks because of this, remove the override once ESLint itself depends on a patched version (Dependabot will open that update).

### D-020: Redesign the frontend: Space × Let's Cook × Swiss, with a minimal Home
- **Date:** 2026-11-07 · **Status:** Accepted · Supersedes the old "cosmic" look (purple/cyan gradients, glass cards, sidebar)
- **Context:** The founder asked for a new frontend that combines three themes (space, the Let's Cook brand, Swiss design), matches the README, and is **minimal, not messy**. The old dashboard showed six blocks at once (hero, four KPI cards, a score gauge, an orbit visualiser with two charts, recent logs, active projects, milestones). A mockup was reviewed and approved before any code changed.
- **Decision:**
  1. **One look everywhere.** Black/white/greys and **one** crimson (`#B8002F` for fills with white text, `#FF4D6A` for crimson *text* on black so it passes contrast). Inter for text with very heavy, tight numbers; JetBrains Mono for small uppercase labels. Flat 1px-line cards, no gradients or glows. Old colour variable names (`--cyan-accent`, `--orbital-orange`, …) are kept but point at the new palette, so every page changed at once without rewriting every template *(renamed to honest names in D-026)*.
  2. **Top bar instead of a sidebar:** Home · Skills · Study sessions · Projects · Goals · Progress, then search, light/dark and the profile picture (which opens Settings). Badges open from the Progress page. *(The light/dark switch was removed in D-025.)*
  3. **Home answers one question: "how is my week going, and what is next?"** Greeting, hours in the last 7 days against the weekly goal, one *Add study time* button, an orbit where each planet is a skill (bigger = further along, crimson = finished), hours for each of the last 7 days, and the next goal and last session. Everything else moved to its page: the progress score to **Progress**, project and goal lists to their pages.
  4. **First visit** (no skills and no study time; since issue #13: nothing saved at all) shows a getting-started screen with *Add your first skill* and *Try it with sample data first* instead of empty widgets.
  5. **Space lives in the visuals** (orbit, planets, a quiet starfield), not in the words; see D-022.
  6. **Motion** is slow and decorative only (orbits turn, stars twinkle). Everything stops under `prefers-reduced-motion`, and no information is shown only through motion.
  7. **Route names stay** (`#dashboard`, `#progress`, `#analytics`, …) so links and bookmarks keep working; only titles changed.
- **Why:** A dashboard that shows everything makes people read everything before they find the one number they came for. Moving detail to its own page keeps it one click away. One accent colour makes the single important action obvious on each screen. Keeping the variable names and route names meant the change touched no stored data and no tests' meaning.
- **Trade-off accepted:**
  - The progress score and badges are no longer on the first screen; people who were motivated by them need one extra click. If that hurts, a single "6 of 10 badges" line on Home is the smallest way back.
  - The orbit shows at most 12 skills and planets have no visible labels (names are in a tooltip and in the screen-reader label).
  - Old variable names (`--cyan-accent` now means "strong text colour") are misleading for new contributors until they are renamed in a follow-up. *(Done in D-026.)*
  - Issues that describe the old dashboard (KPI cards, sidebar) need their wording updated.
- **Alternatives rejected:** Keeping the old layout and only recolouring it: still six blocks on Home. A framework rewrite (React etc.): would invalidate the open issues and the "no build step" rule (B-001) for no user benefit.

### D-021: Serve the fonts from the repo instead of Google Fonts
- **Date:** 2026-11-07 · **Status:** Accepted · Amends D-011
- **Context:** The app loaded Inter and JetBrains Mono from Google Fonts. That is a request to Google on every visit (the README's "no analytics" had to be worded around it), and Google's CSS cannot be pinned with SRI (D-011).
- **Decision:** Ship two files in `assets/fonts/`: Inter variable (latin, 48 KB, every weight) and JetBrains Mono 500 (latin, 24 KB), both under the SIL Open Font License 1.1 (licence files next to them). `style.css` declares them with `@font-face` and `font-display: swap`; Inter is preloaded.
- **Why:** No third-party request for fonts, nothing to pin, works offline once cached, and the redesign depends on Inter's 900 weight looking exactly right.
- **Trade-off accepted:** About 72 KB in the repo and on first load. Only latin characters are included; other scripts fall back to system fonts. Updating the fonts is a manual copy (from the `@fontsource` npm packages).
- **Alternatives rejected:** Keep Google Fonts: an outside request we cannot pin. System fonts only: the Swiss look depends on Inter's heavy numerals.

### D-022: Plain words on screen; stored values stay the same
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** The founder asked that every word on the dashboard be understood by the user. The app used space jargon (Command Center, Mission Logs, Space Missions, Milestones, Velocity, "Atmospheric Ascender"), a Latin motto, abbreviations like `1.25h`, and emoji icons.
- **Decision:**
  - Rule: **every label must make sense to someone opening the app for the first time.** No space jargon, no Latin, no unexplained abbreviations (`1h 15m`, not `1.25h`).
  - Page names: Home, Skills, Study sessions, Projects, Goals, Progress, Badges, Settings. Score levels: Just beginning, Getting started, Good, Very good, Excellent. Badges renamed after what they reward ("7 days in a row").
  - **Stored values do not change.** Statuses like `Completed`, `Practicing`, `On Hold`, badge ids and categories, and the storage key are kept; small label functions (`statusLabel`, `projectStatusLabel`, `typeLabel`, `categoryLabel`) translate them for display only. *(Since D-026 the first three, plus `skillLabel`, live in `utils.js` and every page, search and the charts use them; `categoryLabel` for badge groups stays in `achievements.js`.)*
  - Emoji replaced with a small inline line-icon set (`assets/js/icons.js`).
- **Why:** Many users are students reading in a second language. Renaming stored values would break everyone's saved data and backups and require a migration for no visible gain.
- **Trade-off accepted:** Code and storage still say `missions`, `activities`, `Completed`, so contributors see two vocabularies; the label helpers are the bridge and must be used in new templates.
- **Alternatives rejected:** Keeping the space words with a glossary: the user should not need one. Migrating stored values: risk to existing data.

### D-023: Light/dark is a device choice; replacing the data keeps it
- **Date:** 2026-11-07 · **Status:** Superseded by D-025 (the light theme was removed; the same rule still keeps the backup-reminder state)
- **Context:** The theme is stored inside the same data as skills and sessions. *Load sample data*, *Restore from backup* and *Delete all my data* replace that data, so a user in light mode was silently switched back to dark on the next page load (the sample data and most backups say `dark`).
- **Decision:** `storage.keepCurrentTheme()` copies the current theme into the new data in `loadDemoUniverse`, `resetAllData` and `importJSON`. Every other setting in a backup (daily and weekly goals, sounds) is still restored. Three regression tests cover it.
- **Why:** Light or dark depends on the screen and room someone is in, not on their study data. A backup made on a laptop in dark mode should not change the look of a phone in light mode.
- **Trade-off accepted:** A backup can no longer carry a theme across devices; the user sets it once per device.
- **Alternatives rejected:** Moving the theme to its own `localStorage` key: cleaner, but it changes the stored format and needs a migration (issue #17 covers migrations).

### D-024: Installable and offline with a network-first service worker
- **Date:** 2026-11-07 · **Status:** Accepted
- **Context:** CodeOrbit keeps all data on the device, and most of its users are students on phones, yet it could only be opened as a web page with a connection.
- **Decision:** Add `manifest.webmanifest` (name, icons made from the Let's Cook mark, standalone display) and `sw.js`. The service worker pre-caches the app's own files and the two pinned CDN libraries, and answers every request **network first**: online it behaves exactly like before and refreshes the cache; offline it serves the cached copy. Settings shows *Install CodeOrbit on this device* when the browser offers it. `tests/offline.test.js` fails if a stylesheet, script or font is missing from the offline list, or if a listed file does not exist.
- **Why:**
  - Network first means a new deploy reaches users on their next visit; cache-first would keep serving old code until the worker updates, the classic service-worker trap.
  - The CDN files are cached as CORS responses, so their SRI hashes (D-011) are still checked when they come from the cache.
  - The worker never touches `localStorage`, so it cannot lose or change data.
- **Trade-off accepted:** On a slow connection every load still waits for the network before falling back. Adding a file the app needs now means adding it to `APP_FILES` (the test enforces it). A broken `sw.js` could serve stale files; bump `CACHE_VERSION` to drop old caches. iPhones have no install prompt: users use Share → *Add to Home Screen*.
- **Alternatives rejected:** Cache first / stale-while-revalidate: faster, but users would run old code after fixes, including security fixes. A build tool such as Workbox: conflicts with the no-build rule (B-001).

### D-025: One dark look; the light theme is removed
- **Date:** 2026-11-07 · **Status:** Accepted · Supersedes D-023
- **Context:** After the redesign, the light theme needed its own colour tokens, logo and icon versions, chart colours, star colours and fixes (D-023 and a round of light-mode bugs), and it was the part of the look that kept breaking. The founder decided CodeOrbit should have one look.
- **Decision:** Remove the light theme: the top-bar switch, the *Appearance* setting, the light tokens and logo, `applyTheme()`, and the theme branch in the charts and the starfield. `theme` is no longer written to new data; an old saved `theme` value is simply ignored, so nobody's data needs changing. `storage.keepDeviceSettings()` (was `keepCurrentTheme`) still keeps the backup-reminder state when data is replaced. Offline cache bumped to `codeorbit-v2` so removed files are dropped.
- **Why:** The brand is black, white and crimson on dark; a single look halves the styling to keep consistent and test, and removes a whole class of "white text on white" bugs.
- **Trade-off accepted:** Some people read better on a light background (bright rooms, astigmatism). They lose that option. If users ask for it, it can be restored from git history (`63b20f9` has the last complete version), ideally driven by the system setting (`prefers-color-scheme`) rather than a manual switch.
- **Alternatives rejected:** Keeping it but hiding the switch: unmaintained code that still has to be tested.

### D-026: Full consistency review: one sound rule, safe links, shared labels, honest names
- **Date:** 2026-11-08 · **Status:** Accepted · Amends D-018, D-020, D-022, B-003, B-009
- **Context:** The founder asked for a line-by-line review so that code, on-screen text, docs and issues all say the same thing. It also records the Home features added after D-025 (one-tap +30 min, the backup reminder, "Your week in review"), which had no entry yet. The review found real bugs, not only wording:
  - **Settings → Sounds did nothing.** `soundEnabled` was saved but never read, and the app played a chime on every success message and a click on every dialog, while the setting said "Play a short sound when you earn a badge".
  - **`javascript:` links from a backup file were rendered** on project cards (see the correction in D-018), and item ids from a backup were put into HTML attributes unescaped.
  - The weekly goal defaulted to **12 hours** on Home, Settings and the recap but **10** in the score and for new users. The recap saved goals like 10.5 that the Settings field (step 1) then refused to save. The duration field (minimum 5, step 5) refused sessions of 1–4 or 7 minutes, which restores and the +30 shortcut can create.
  - Restore error messages showed parser text ("Missing essential CodeOrbit collections…"). Search showed raw stored values ("In Progress", "General Exploration", `2026-11-20`). Badge counts could exceed 10 after restoring a backup with unknown badge ids. Projects had no "Paused" filter and skills no "Not started" filter. Editing a session whose skill was deleted silently cleared its skill. New projects started with "TypeScript, Node.js" already filled in.
  - Dead code: notification-panel CSS, unused colour tokens and classes, hidden icons in every number strip, `minutesToHours`, `unlockAchievement`, `reducedMotion`, two unused images.
- **Decision:**
  1. **Sounds:** the badge chime is the only sound. `app.js` copies `settings.soundEnabled` into `sounds.enabled` at start-up and after every save.
  2. **Links:** `safeUrl()` in `utils.js` lets only `http://` and `https://` through, on the cards and in the project form. Ids in attributes are escaped. The browser security check now uses the real field names.
  3. **Labels:** `statusLabel`, `projectStatusLabel`, `typeLabel` and a new `skillLabel` ("General Exploration" → "General") move to `utils.js`, with tests, and are used by every page, search, the charts and the recap.
  4. **Defaults:** `DEFAULT_DAILY_HOURS = 2` and `DEFAULT_WEEKLY_HOURS = 10` in `utils.js`, used everywhere. Weekly goal fields accept halves; the duration field accepts any whole number of minutes from 1.
  5. **Home features (recorded here):** *+30 min* adds 30 minutes today on the skill studied most recently, with Undo for 10 seconds. The **backup reminder** shows with 3+ sessions, not sample data, and no backup in 30 days; *Not now* waits 7 days; downloading or restoring a backup counts. Sample data is marked `sampleData`, and the mark is **removed as soon as you add or change a skill, session, project or goal**, because from then on the data is yours. **Week in review** covers Monday–Sunday and is offered on Sundays and Mondays until opened. Replacing all data (sample, restore, delete all) unlocks badges **quietly**.
  6. **Honest names:** colour tokens renamed (`--cyan-accent` → `--text-primary`, `--orbital-orange` → `--accent-text`, …), CSS classes and element ids renamed (`badge-cyan` → `badge-muted`, `sidebar-avatar-img` → `topbar-avatar`, `productivity-card` → `score-card`, …), `calculateProductivityScore` → `calculateProgressScore`, `loadDemoUniverse` → `loadSampleData`, backup file `codeorbit-backup-DATE.json`. Stored keys and values do **not** change (D-022).
  7. Remove the dead code listed above. Dependabot uses its default `dependencies` label (the custom `security` and `dependencies` labels did not exist).
- **Why:** A setting that does nothing, or a doc that names a button that does not exist, costs trust in everything else. Each bug above was reproduced first (in the browser or a unit test) and has a test now: 88 unit tests in 4 timezones, plus the browser checks for offline use, XSS (0 payloads run, 0 unsafe links) and the Home features.
- **Trade-off accepted:** Renaming ids and classes breaks any personal user style or script that targeted the old names (none known). Old backups named `codeorbit-universe-*.json` still restore; only new downloads get the new name. Sample data used for real stops being "sample" after one edit, so a person who only tries it out by adding one session will see a backup reminder.
- **Alternatives rejected:** Keeping the old names with comments: every new contributor would have to learn that "cyan" means white. Making all success messages chime again and relabelling the setting: the founder asked for a calm app; one sound is enough.

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
- **Status:** Still in force; the re-render rules around it were tightened in D-005 and D-006. Amended: Home now imports other pages' dialog openers (`openSkillModal`, `openActivityModal`, `downloadBackup`, `openRecap`) and Progress reads the badge list, but data still flows only through `storage` and the event (see `FLOW.md` §9).
- **Likely why:** Page modules stay independent (none imported another when this was written). Any write anywhere refreshes whatever is on screen.
- **Trade-offs:** The event says only "something changed", so listeners re-render whole pages. Dispatch is synchronous, so a save inside a listener (achievement unlocks) triggers a nested round of re-renders (see `FLOW.md` §6).

### B-004: Hash-based routing (`#skills`, `#goals`, …)
- **Likely why:** Works on any static host without server rewrite rules; back/forward buttons work for free.
- **Trade-off:** URLs contain `#`; all 8 pages live in one HTML file (1,400+ lines).

### B-005: Chart.js 4.4.7 from the jsDelivr CDN
- **Status:** Library choice still in force; loading superseded by D-011 (SRI hash, real file path)
- **Likely why:** Mature, well-documented, canvas-based, handles bar/line/doughnut charts with theming, and needs no bundler.
- **Trade-offs:** The app depends on jsDelivr being reachable; if the script is blocked, `chartManager` silently skips charts. Loaded **without a Subresource Integrity (`integrity`) hash**, so a tampered CDN file would run with full page access.

### B-006: Lucide icons from unpkg, version `@latest`
- **Status:** Superseded by D-011
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
- **Status:** Amended by D-026: only the badge chime is left, and Settings → Sounds now really turns it off (the setting used to be saved but never read).
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

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

### D-004: Deployment target: Render vs GitHub Pages
- **Date:** 2026-11-07 · **Status:** Proposed, awaiting maintainer decision
- **Context:** The live site runs on Render, but `.github/workflows/deploy.yml` deploys to GitHub Pages, which is not enabled. The workflow has failed on every run, and four Dependabot PRs exist only to update that workflow's actions.
- **Options:**
  - **A. Keep Render:** delete `deploy.yml`, close the Dependabot PRs for it. *Cost:* deploys depend on a third-party account outside the GitHub org.
  - **B. Move to GitHub Pages:** enable Pages, keep the workflow, update README links. *Cost:* the public URL changes.
- **Recommended:** A. Render already works and deploys automatically from `main`; the failing workflow adds nothing but a red ❌ on every commit.

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

# Changelog

All notable changes to CodeOrbit are recorded here, newest first.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/). While the version is below 1.0.0, any release may change features or the stored data format.

**How to add an entry:** put a line under `Unreleased` in the same PR as your change, in the right group (`Added`, `Changed`, `Fixed`, `Removed`, `Security`). Write it for users, not for developers. Maintainers move `Unreleased` into a numbered version when they cut a release.

## [Unreleased]

### Added
- Automated lint (ESLint) and formatting (Prettier) checks on every pull request and push. The live site only deploys when they pass.

### Removed
- An unused skills "proficiency" filter that had no button to turn it on.

## [0.1.0] - 2026-11-07

First public version under the LetsCook-Organization GitHub org.

### Added
- Skill Universe, Mission Logs, Space Missions (projects), Milestones (goals), Command Center dashboard, 10 achievements, 5 analytics charts, command palette (`Ctrl+K`), dark/light themes, JSON export/import.
- Live site on GitHub Pages: <https://letscook-organization.github.io/CodeOrbit/>, deployed automatically on every push to `main`.
- `docs/DECISIONS.md` (why things are built the way they are) and `docs/FLOW.md` (how code execution moves between files).
- This changelog.

### Changed
- New users now start with an **empty** universe. Demo data ("Alex Rivera") is opt-in from Settings → Load Demo Universe.
- Startup renders only the page you are looking at instead of every page (dashboard startup went from 9 chart builds to 2).
- If one part of the app fails to start, the rest keeps working and a message says which part failed.
- Version label corrected from 1.0.0 to 0.1.0, and README claims brought in line with what the app actually does.

### Fixed
- "Last 7 days" now means the same thing on every screen (local calendar days). Before, the dashboard, score, analytics and charts could show different weekly hours for the same sessions.
- The weekly chart showed every session one day early for users east of UTC (including all of India).
- New users no longer get achievements unlocked by demo data they never created.
- Saving preferences no longer saves twice; adding data no longer checks achievements twice.
- Importing a backup without a profile no longer fills in the demo user's profile.
- Unreadable saved data is now backed up (`codeorbit_universe_v1_corrupt_backup`) instead of being silently replaced.

### Security
- Chart.js and Lucide are pinned to exact versions (4.4.7 and 1.70.0) and protected with Subresource Integrity hashes; a modified CDN file is refused by the browser.
- Deployment GitHub Actions are pinned to commit SHAs with least-privilege permissions.

### Removed
- The broken GitHub Pages workflow that failed on every push (replaced by a working one), and duplicate copies of the contributing/security/conduct docs in `docs/`.

[Unreleased]: https://github.com/LetsCook-Organization/CodeOrbit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/LetsCook-Organization/CodeOrbit/releases/tag/v0.1.0

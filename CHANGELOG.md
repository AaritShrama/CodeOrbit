# Changelog

All notable changes to CodeOrbit are recorded here, newest first.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions follow [Semantic Versioning](https://semver.org/). While the version is below 1.0.0, any release may change features or the stored data format.

**How to add an entry:** put a line under `Unreleased` in the same PR as your change, in the right group (`Added`, `Changed`, `Fixed`, `Removed`, `Security`). Write it for users, not for developers. Maintainers move `Unreleased` into a numbered version when they cut a release.

## [Unreleased]

### Added
- A new look for the whole app: black and white with one Let's Cook crimson, big clear numbers, and a quiet space theme.
- A first-visit screen that explains the app and offers *Add your first skill* or *Try it with sample data first*.
- Home shows each skill as a planet: the bigger it is, the further along you are; red means finished.
- "Your week in review": on Sundays and Mondays Home offers a short look back at the week (hours, days studied, best day, most studied skill, compared with the week before) and lets you set next week's goal. Always available from the Progress page.
- CodeOrbit can be installed as an app (Settings → *Install CodeOrbit on this device*, or *Add to Home Screen* on iPhone) and opens without internet once you have used it online. New app icon made from the Let's Cook logo.
- A backup reminder at the bottom of Home when you have real data and no backup in the last 30 days, with *Download backup* and *Not now* (asks again in a week). It never shows for sample data.
- If you studied yesterday but not yet today, Home now says "Study today to keep your 4 days in a row going." in crimson, while there is still time to save the run.
- One-tap logging on Home: a "+30 min on <your last skill>" button next to *Add study time*, with an Undo for 10 seconds.
- Tap, click or Tab to a planet on Home to see which skill it is and how far along you are. The orbit holds still while you choose. Works on phones and with a keyboard.
- Automated lint (ESLint) and formatting (Prettier) checks on every pull request and push. The live site only deploys when they pass.
- Unit tests for dates, days in a row, the progress score, the backup reminder, the week in review, storage, backup and restore, safe text and links, page addresses and badge rules, run in four timezones on every pull request and push.
- Filters for **Not started** skills and **Paused** projects.

### Changed
- Home is now minimal: hours studied in the last 7 days against your weekly goal, your skills as planets, hours for each day, and what is coming up. The progress score and badges moved to the new **Progress** page.
- Navigation is a top bar: Home, Skills, Study sessions, Projects, Goals, Progress. Settings opens from your profile picture.
- Plain words everywhere: "Mission Logs" is now **Study sessions**, "Space Missions" **Projects**, "Milestones" **Goals**, "Analytics" **Progress**, "Achievements" **Badges**; times are written like "1h 15m". Your saved data is not changed.
- Fonts now load from CodeOrbit itself instead of Google Fonts.
- Badges and search results use simple line icons instead of emoji.
- Search shows the same words as the pages ("Finished", "Project work", "General") and dates like "Nov 20, 2026".
- Backups now download as `codeorbit-backup-<date>.json`. Older backup files still restore.
- New projects start with an empty "Tools used" list instead of "TypeScript, Node.js".

### Fixed
- The getting-started screen (and its *Try it with sample data first* button) appeared when you had only projects or goals, and loading sample data would have replaced them. It now only appears when nothing at all is saved.
- Skill cards were hard on the eyes: too many bright, heavy elements. They are calmer now: softer numbers, grey planets and bars (crimson only when finished), plain-text categories, and regular digits on the ±10% buttons. Main text is now a soft off-white instead of near-pure white.
- Loading sample data, restoring a backup or deleting all data no longer shows "You earned a badge" pop-ups. Badges you really earn still get one.
- Finished goals no longer show as "late".
- The chosen profile picture in Settings is now visibly selected.
- Search results can be opened with the keyboard.
- Pop-ups (add study time, add skill, search, and the rest) now slide in and fade out instead of appearing and disappearing in one jump. The motion is turned off if your device asks for reduced motion.
- A brand-new account with nothing logged showed a progress score of 20/100. It now shows 0 until the first session is added.
- "Your best day" on the Progress page (called "Peak Velocity Day" before) showed the previous weekday for users west of UTC (e.g. Saturday counted as Friday in the US).
- **Settings → Sounds did nothing**, and the app chimed on every saved change and clicked on every pop-up. Now the only sound is the chime when you earn a badge, and turning Sounds off turns it off.
- The weekly goal was 12 hours on some screens and 10 on others when you had not set one. It is 10 everywhere now.
- A weekly goal like 10.5 hours, saved from "Your week in review", could not be saved again in Settings. Half hours now work in both.
- Study sessions shorter than 5 minutes, or not a multiple of 5 (e.g. 7 minutes), could not be edited. Any whole number of minutes from 1 works now.
- Editing a study session whose skill had been deleted cleared its skill when you saved. The old skill name is now kept as a choice.
- The skill filter on Study sessions now also lists "General" and skills you deleted, so every session can be found.
- Restoring a file that is not a CodeOrbit backup showed a technical error. It now says plainly that the file is not a CodeOrbit backup.
- Restoring a backup with unknown badges could show more than 10 of 10 badges earned. ([#9](https://github.com/LetsCook-Organization/CodeOrbit/issues/9), [#21](https://github.com/LetsCook-Organization/CodeOrbit/pull/21), thanks [@bfs2021](https://github.com/bfs2021))

### Security
- A page address like `#constructor` or `#toString` passed the page check and showed a completely blank app; only the 8 real pages are accepted now. An error message no longer uses the page address as a console format string (found by CodeQL).
- Importing a backup file made by someone else could run their code in your browser, through fake dates or a session's skill name. Invalid dates are now shown as "Invalid date" and dropped on import, and those names are escaped. Sessions and badges without a valid date are removed when importing.
- A backup file made by someone else could also put a `javascript:` link on a project's *Code* or *Live site* button, which would run their code when clicked, and could hide HTML in item ids. Only `http://` and `https://` links are shown now, and ids are escaped.

### Removed
- The light theme. CodeOrbit now has one dark look, and the light/dark switch and the *Appearance* setting are gone. If you had light mode on, the app simply opens in dark; none of your data changes.
- The quick "Launch" menu and the notifications bell. Each page has its own add button, and Home has *Add study time*.
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

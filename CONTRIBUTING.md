# Contributing to CodeOrbit

Welcome to **CodeOrbit**! We are thrilled that you are interested in contributing.

CodeOrbit is a free, open-source study tracker for people learning to code, made by **Let's Cook — The Foundry**. You add the skills you are learning, the time you study, your projects and your goals, and CodeOrbit shows your progress. Everything stays in your own browser.

We actively encourage and welcome contributions from developers of **all skill levels** — especially beginners making their very first open-source contributions!

---

## 🧭 Core Project Principles

Before contributing code, please keep our core architectural rules in mind:

1. **Zero Heavy Frontend Frameworks:**  
   CodeOrbit is intentionally built with **pure HTML5, CSS3, and Vanilla JavaScript ES6+ modules**. Please do not submit pull requests converting the application to React, Next.js, Vue, Angular, or Tailwind CSS. Keeping it vanilla ensures any beginner can open the code in any browser and inspect it without a complex Node/npm build chain.
2. **Private, and works offline:**  
   All data lives only in the browser's `localStorage`. Do not add a backend, a cloud database, sign-in, analytics, or paid APIs. The app works offline after the first visit (`sw.js`, see D-024 in [`docs/DECISIONS.md`](docs/DECISIONS.md)).
3. **Plain words in the app:**  
   Write what people see the way you would say it to a friend: "Study sessions", not "Mission logs"; "Finished", not "Completed"; "late", not "overdue". Stored values never change (old backups must keep working), so show them through the label helpers in [`assets/js/utils.js`](assets/js/utils.js): `statusLabel`, `projectStatusLabel`, `typeLabel`, `skillLabel` (D-022).
4. **Inclusive & Supportive Community:**  
   We celebrate learners. No question is too simple, and mistakes are treated as learning opportunities. Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🛠 Beginner-Friendly Local Setup

You do **not** need `npm install`, Node.js, Webpack, Vite, or any build setup to run and develop CodeOrbit!

Node.js is only needed if you want to run the automated code checks on your own computer before pushing (see step 5). If you skip that, the same checks run automatically on your pull request.

### Prerequisites
- A modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, or Apple Safari).
- A text editor or IDE (such as VS Code, Sublime Text, or Cursor).
- Git installed on your computer.

### Step 1: Fork the Repository
Click the **Fork** button at the top-right corner of the [CodeOrbit GitHub repository](https://github.com/LetsCook-Organization/CodeOrbit) to create your personal copy under `your-username/CodeOrbit`.

### Step 2: Clone Your Fork
Clone your newly forked repository to your local machine:

```bash
git clone https://github.com/your-username/CodeOrbit.git
cd CodeOrbit
```

Add the upstream remote so you can easily sync with the official repository:

```bash
git remote add upstream https://github.com/LetsCook-Organization/CodeOrbit.git
git remote -v
```

### Step 3: Run the Application Locally
Because CodeOrbit uses native JavaScript ES Modules (`import`/`export`), web browsers require files to be served via HTTP/HTTPS rather than the `file://` protocol.

Choose any of the simple options below:

- **Option A — VS Code Live Server (Recommended):**  
  Install the "Live Server" extension in VS Code. Right-click [`index.html`](index.html) and select **"Open with Live Server"**.
- **Option B — Python (Built into most systems):**  
  ```bash
  # Python 3
  python -m http.server 3000
  ```
  Open `http://localhost:3000` in your browser.
- **Option C — Node `npx serve`:**  
  ```bash
  npx serve .
  ```
  Open the displayed local URL in your browser.

---

## 🚀 Contribution Workflow

Follow this step-by-step workflow when working on a change:

### 1. Find or Propose an Issue
- Browse the [GitHub Issues](https://github.com/LetsCook-Organization/CodeOrbit/issues) tab. Look for issues labeled `good first issue`, `documentation`, `bug`, or `enhancement`.
- If you have an idea for a new feature or notice a bug that hasn't been reported, please open an issue first using our **Bug Report** or **Feature Request** templates before writing code.
- Comment on the issue you wish to work on so maintainers can assign it to you and avoid duplicate work.

### 2. Create a Topic Branch
Never work directly on your `main` branch. Create a new branch with a descriptive name:

```bash
# For a new feature:
git checkout -b feat/interactive-session-timer

# For a bug fix:
git checkout -b fix/goal-days-left-timezone
```

### 3. Implement Your Changes
- Follow the structure in `assets/js/*.js`: one file per page, `storage.js` is the only file that touches `localStorage`. [`docs/FLOW.md`](docs/FLOW.md) shows what calls what.
- **Text from the user or a backup file:** always pass it through `escapeHTML()` before putting it into HTML, and pass links through `safeUrl()` (both in [`assets/js/utils.js`](assets/js/utils.js)). `escapeHTML` alone does not stop a `javascript:` link.
- Use the design tokens in [`assets/css/style.css`](assets/css/style.css) (colours, spacing, type) instead of new hard-coded values. There is one look: dark (D-025).
- **Added, removed or renamed a file the app loads?** Update `APP_FILES` in [`sw.js`](sw.js) (a test checks it), and bump `CACHE_VERSION` when you remove or rename one.
- Keep comments true: if your change makes a comment or a doc wrong, fix it in the same pull request.

### 4. Commit Conventions
We use **Conventional Commits** to maintain a clean, readable Git history. Prefix your commit messages with one of the following:

- `feat:` A new feature or capability (e.g. `feat: add a category filter to goals`)
- `fix:` A bug fix (e.g. `fix: count days in a row correctly across month boundaries`)
- `style:` Visual, styling, or formatting refinements (e.g. `style: adjust card padding on mobile`)
- `refactor:` Code changes that neither fix a bug nor add a feature
- `docs:` Documentation updates or additions (e.g. `docs: update local setup guide`)
- `test:` Adding or updating tests or verification scripts
- `chore:` Maintenance, repository setup, or asset updates

**Example Commit Command:**
```bash
git add assets/js/skills.js
git commit -m "feat(skills): add quick-step buttons for skill progress"
```

### 5. Testing Your Changes

**Automated checks.** Every pull request runs three things: ESLint (catches bugs such as unused or undefined variables), Prettier (consistent formatting) and the unit tests. A pull request with a red ❌ cannot be merged. To run the same checks locally (needs [Node.js](https://nodejs.org/) 20.4 or newer):

```bash
npm install          # one time: installs the dev tools into node_modules/ (not committed)
npm run check        # lint + format check + unit tests, exactly like CI
npm test             # unit tests only, in 4 timezones (India, UTC, US West, UTC+14)
npm run test:quick   # unit tests only, in your computer's timezone (faster)
npm run format       # auto-fixes formatting
npm run lint:fix     # auto-fixes the lint problems that can be fixed automatically
```

**Writing tests.** Tests live in `tests/*.test.js` and use Node's built-in test runner (`node:test`); there is no test library to learn. If you change logic in `utils.js`, `storage.js`, `navigation.js` or the badge rules in `achievements.js`, add or update a test. For anything involving dates, freeze the clock with `freezeTime()` from `tests/helpers/clock.js`; the runner repeats every test in four timezones, so a date bug cannot hide in the one timezone you happen to be in.

Prettier formats JavaScript, CSS, JSON and YAML. It does not touch `index.html` or Markdown files.

**Manual checks.** Then perform these verification checks in the browser:

1. **It works:** try your change in the browser. Add, edit and delete things, and check the numbers on Home and Progress still make sense.
2. **Zero Console Errors:** Open browser DevTools (`F12` or `Ctrl+Shift+I` / `Cmd+Option+I`) and check the **Console** tab. Ensure there are **no red errors or unhandled exceptions**.
3. **LocalStorage Persistence:** Refresh the browser page (`F5`) and confirm that your changes persisted in `localStorage`.
4. **Responsive Layout:** Test the page at different window widths (Desktop 1440px, Tablet 768px, Mobile 375px) using the DevTools Device Toolbar to ensure no horizontal scrollbars or element clipping occur.
5. **Accessibility:** Verify that dialogs can be closed with the `Escape` key and interactive elements can be navigated using the `Tab` key.

### 6. Keep Your Branch Synchronized
Before pushing, ensure your branch is up to date with `main`:

```bash
git checkout main
git pull upstream main
git checkout your-branch-name
git merge main
```

### 7. Push and Open a Pull Request
Push your branch to your GitHub fork:

```bash
git push origin your-branch-name
```

1. Navigate to the [CodeOrbit GitHub repository](https://github.com/LetsCook-Organization/CodeOrbit).
2. You will see a banner prompting you to **"Compare & pull request"**. Click it.
3. Complete the **Pull Request Template** provided:
   - Provide a concise summary of what was changed and why.
   - Reference the issue number (e.g. `Fixes #12`).
   - Check off the verification checklist.
4. Click **Create pull request**.

### 8. Code Review & Celebration
- Project maintainers will review your pull request, provide constructive feedback, or request minor adjustments if needed.
- If changes are requested, simply make the edits in your local branch, commit them, and push them to your fork. The pull request will update automatically.
- Once approved, your pull request will be merged into `main`! 🎉

---

## 💡 Picking an Issue

Every open issue says which files to change and exactly what "done" means. Use the labels to find one that fits you:

| Label | Meaning |
| :--- | :--- |
| [`good first issue`](https://github.com/LetsCook-Organization/CodeOrbit/issues?q=is%3Aopen+label%3A%22good+first+issue%22) | Small, well-defined, a few hours. Start here. |
| [`help wanted`](https://github.com/LetsCook-Organization/CodeOrbit/issues?q=is%3Aopen+label%3A%22help+wanted%22) | Bigger tasks the maintainers would love help with |
| `difficulty: easy` / `medium` / `hard` | Rough size. **Hard** issues need a design agreed in the comments before any code. |
| `bug`, `tests`, `accessibility`, `data`, `dates & timezones`, `documentation`, `enhancement` | What area the work is in |

**How to claim one**
1. Comment on the issue ("I'd like to work on this") and wait to be assigned. Unassigned PRs for assigned issues may be closed.
2. **One `good first issue` per person.** They are meant for people making their first contribution; after your first one is merged, move on to `help wanted` issues and leave the rest for newcomers.
3. If you are assigned but cannot continue, say so in the issue. Issues with no activity for **14 days** may be reassigned.
4. Found a problem that has no issue? Open one first (bug report or feature request template) so it can be discussed.

---

## ❓ Need Assistance?

If you get stuck, have a question about the code, or need help with Git, ask in the issue you are working on (or open a new issue with your question). We are here to help you grow!

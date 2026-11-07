# Contributing to CodeOrbit

Welcome to **CodeOrbit**! We are thrilled that you are interested in contributing.

CodeOrbit is an open-source developer productivity and learning management platform developed under **LET'S COOK — THE FOUNDRY**. Our mission is to provide students, engineers, and creators with a beautifully designed, zero-friction universe to track their skills, coding sprints, projects, and velocity.

We actively encourage and welcome contributions from developers of **all skill levels** — especially beginners making their very first open-source contributions!

---

## 🧭 Core Project Principles

Before contributing code, please keep our core architectural rules in mind:

1. **Zero Heavy Frontend Frameworks:**  
   CodeOrbit is intentionally built with **pure HTML5, CSS3, and Vanilla JavaScript ES6+ modules**. Please do not submit pull requests converting the application to React, Next.js, Vue, Angular, or Tailwind CSS. Keeping it vanilla ensures any beginner can open the code in any browser and inspect it without a complex Node/npm build chain.
2. **Privacy-First & 100% Offline:**  
   All data lives exclusively in browser `localStorage`. Do not introduce required external backends, cloud databases, user authentication services, or paid APIs.
3. **Inclusive & Supportive Community:**  
   We celebrate learners. No question is too simple, and mistakes are treated as learning opportunities. Please adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

---

## 🛠 Beginner-Friendly Local Setup

You do **not** need `npm install`, Node.js, Webpack, Vite, or any build setup to run and develop CodeOrbit!

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
  Install the "Live Server" extension in VS Code. Right-click [`index.html`](../index.html) and select **"Open with Live Server"**.
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
git checkout -b fix/orbital-canvas-resize
```

### 3. Implement Your Changes
- Follow the modular structure in `assets/js/*.js`.
- Always sanitize any user-supplied strings before rendering into HTML by using `escapeHTML()` from [`assets/js/utils.js`](../assets/js/utils.js).
- Use design tokens from [`assets/css/style.css`](../assets/css/style.css) (colors, spacing, typography) rather than hardcoded inline values.
- Maintain documentation integrity: preserve existing comments and add helpful explanations for new logic.

### 4. Commit Conventions
We use **Conventional Commits** to maintain a clean, readable Git history. Prefix your commit messages with one of the following:

- `feat:` A new feature or capability (e.g. `feat: add category filter to milestones`)
- `fix:` A bug fix (e.g. `fix: correct streak calculation across month boundaries`)
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
Before opening a pull request, perform these verification checks:

1. **Browser Functionality:** Manually test the feature in your browser. Create, edit, and delete items to ensure CRUD pipelines work smoothly.
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

## 💡 Good First Contribution Ideas

Looking for a place to begin? Here are great ways to contribute:

- Improving documentation, fixing typos, or translating guides.
- Adding new responsive styling refinements for uncommon screen sizes.
- Enhancing keyboard accessibility or ARIA announcements.
- Suggesting new achievable Universe Badges in `assets/js/achievements.js`.
- Adding subtle micro-interaction enhancements to CSS transitions.

---

## ❓ Need Assistance?

If you encounter any roadblocks, have questions about the codebase, or need guidance on Git, feel free to open a discussion or ask in your issue thread. We are here to help you grow!

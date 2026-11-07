# Contributing to CodeOrbit

Thank you for your interest in contributing to **CodeOrbit**!  
We are dedicated to building a welcoming, beginner-friendly open-source environment under **LET'S COOK — THE FOUNDRY**.

---

## 1. Ground Rules

- **Zero Heavy Frameworks:** Please do not submit PRs converting the codebase to React, Next.js, Vue, or Tailwind. CodeOrbit deliberately maintains vanilla HTML5, CSS3, and ES6+ modules so beginners can run and inspect it without build tooling.
- **Data Privacy First:** All features must function offline and store state locally in browser `localStorage`. Do not introduce required external backends or paid APIs.
- **Readable & Modular Code:** Keep functions concise, self-documenting, and properly commented.

---

## 2. Local Development Setup

No `npm install`, no build scripts, no bundlers!

1. **Clone the repository:**
   ```bash
   git clone https://github.com/LetsCook-Organization/CodeOrbit.git
   cd CodeOrbit
   ```

2. **Serve the project:**
   Because CodeOrbit uses native JavaScript ES Modules (`import`/`export`), open the directory via any local static server:
   - **VS Code Live Server:** Right-click `index.html` -> "Open with Live Server"
   - **Python:**
     ```bash
     python -m http.server 3000
     ```
   - **Node:**
     ```bash
     npx serve .
     ```

3. Open `http://localhost:3000` in your modern browser.

---

## 3. Submitting Pull Requests

1. Create a branch with a descriptive name:
   ```bash
   git checkout -b feature/orbital-filter-enhancement
   ```
2. Commit with meaningful conventional commit messages:
   ```bash
   git commit -m "feat(skills): add tags search to skill universe"
   ```
3. Push to your fork and submit a Pull Request.
4. Describe your changes clearly and link any associated issues.

---

## 4. Code of Conduct

Be kind, respectful, and supportive. We celebrate all learners and contributors regardless of their level of experience.

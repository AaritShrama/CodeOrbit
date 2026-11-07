# Security Policy

## Supported Versions

CodeOrbit is an open-source, client-side only browser web application. The latest released version on the `main` branch is actively supported with security patches:

| Version | Supported          |
| :--- | :--- |
| **1.0.x** | :white_check_mark: |
| < 1.0.0 | :x: |

---

## Client-Side Zero-Trust Security Model

CodeOrbit runs 100% locally in your browser. It was designed from day one to operate securely without external attack surfaces:

- **Zero Remote Telemetry & Tracking:** All user data resides strictly within the browser's `localStorage`. No user credentials, keystrokes, or habits are ever sent across a network.
- **XSS Sanitization:** All user-supplied inputs pass through string sanitization (`escapeHTML()`) before being injected into the DOM, eliminating cross-site scripting risks.
- **Schema & Type Validation:** Imported JSON universe backups undergo strict structure and type validation, preventing malformed state crashes, prototype manipulation, or invalid data injection.
- **Protocol Enforcement:** External project URLs (`GitHub`, `Live Demo`) enforce secure `http://` or `https://` schemes and include `rel="noopener noreferrer"` attributes to prevent tab-nabbing.
- **Content Security Alignment:** CodeOrbit does not use `eval()`, `Function()` constructor strings, or dynamic remote script injection.

---

## Reporting a Vulnerability

If you identify a security vulnerability or potential threat in CodeOrbit, please **do not disclose it publicly** in public GitHub issues, discussions, or social channels.

Instead, please responsibly report the issue to the maintainers of **LET'S COOK — THE FOUNDRY**:
- **Email:** `security@letscook.foundry`
- **GitHub:** Open a [Private Vulnerability Advisory](https://github.com/LetsCook-Organization/CodeOrbit/security/advisories/new)

Please include:
1. A clear description of the vulnerability.
2. Step-by-step instructions or proof-of-concept to reproduce the behavior.
3. The potential impact on users or their local browser storage.

We will acknowledge your report within **48 hours** and provide regular updates until a security advisory and patch are released.

# Security Policy

## Supported Versions

CodeOrbit is an open-source, client-side only browser application. The latest released version on `main` branch is supported with security patches:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Client-Side Security Model

CodeOrbit strictly adheres to a zero-trust client model:
- **No Remote Telemetry or Tracking:** All data resides exclusively in the user's browser `localStorage`.
- **HTML Sanitization:** All user-supplied inputs pass through DOM escaping (`escapeHTML()`) prior to rendering.
- **Safe JSON Parsing:** Imported JSON backups undergo schema and type validation to prevent prototype pollution or malformed state crashes.
- **Protocol Enforcement:** All external portfolio URLs (`GitHub`, `Live Demo`) enforce secure `http://` or `https://` schemas and use `rel="noopener noreferrer"`.

## Reporting a Vulnerability

If you discover a security issue or vulnerability, please do not disclose it publicly in GitHub Issues.

Instead, please send an email to the security contacts at **LET'S COOK — THE FOUNDRY**:
- Email: `security@letscook.foundry` (or open a Private Vulnerability Advisory on GitHub).

We will review your submission and respond within 48 hours.

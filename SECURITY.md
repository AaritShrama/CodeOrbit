# Security Policy

CodeOrbit is a free, open-source study tracker for developers, made and maintained by **LET'S COOK — THE FOUNDRY**. It runs entirely in the browser: there is no server and no account, and data stays in the browser's `localStorage`. We take the security, data privacy, and integrity of our software seriously and appreciate the efforts of security researchers and open-source contributors who help us maintain a safe platform.

This security policy outlines the procedures for responsibly disclosing security vulnerabilities, our response and remediation workflow, supported versions, and the scope of our security coverage.

---

## 1. Supported Versions

CodeOrbit is an open-source, client-side web application. Security updates and patches are actively provided for the following releases:

| Version | Supported | Status |
| :--- | :--- | :--- |
| **Latest `main`** (currently 0.2.x) | :white_check_mark: | Supported: this is what is deployed to the live site |
| Older commits and forks | :x: | Unsupported |

CodeOrbit is pre-1.0 and has no long-term support branches: fixes land on `main` and deploy immediately. Self-hosters should stay on the latest commit of `main`. Released versions are listed in [CHANGELOG.md](CHANGELOG.md).

---

## 2. Reporting a Vulnerability

If you identify a security vulnerability or potential threat in CodeOrbit, **do not disclose it publicly** through public GitHub Issues, pull requests, or social media channels. Public disclosure before a fix is prepared exposes users and self-hosters to unnecessary risk.

### Preferred Reporting Channels

Please responsibly submit your report to the maintainers using one of the following methods:

1. **GitHub Private Vulnerability Advisory (Recommended):**  
   Open a confidential report through GitHub's native advisory interface:  
   👉 **[Submit a Private Security Advisory](https://github.com/LetsCook-Organization/CodeOrbit/security/advisories/new)**

2. **Direct Security Email:**  
   Send an encrypted or confidential email directly to our primary security contact:  
   📧 **[foundry@letscook.co.in](mailto:foundry@letscook.co.in)**

### Information to Include in Your Report

To help us investigate, triage, and remediate the issue effectively, please include:
- **Description:** A clear summary of the vulnerability, including the vulnerability type (e.g., XSS, insecure data deserialization, workflow injection).
- **Steps to Reproduce:** Detailed, step-by-step instructions or reproduction steps to trigger the issue.
- **Affected Files & Components:** Specific file paths, line numbers, or modules involved (e.g., `assets/js/storage.js`).
- **Potential Impact:** An honest assessment of the real-world impact on users, their browser session, or their local data.
- **Proof of Concept (PoC):** A minimal, safe reproduction script or scenario (please do not execute destructive or weaponized payloads).
- **Suggested Remediation:** Any proposed fixes, code patches, or architectural recommendations, if available.

---

## 3. Response & Remediation Process

When a vulnerability report is submitted, **LET'S COOK — THE FOUNDRY** follows a structured incident response workflow:

```text
[ Report Received ] ──► [ Triage & Acknowledgment ] ──► [ Impact Assessment ]
                                                                │
[ Coordinated Disclosure ] ◄── [ Patch & Testing ] ◄────────────┘
```

1. **Receipt & Acknowledgment:** Maintainers receive the report and send an acknowledgment confirming receipt.
2. **Investigation & Assessment:** The maintainers investigate the reported behavior, verify whether it can be reproduced, and evaluate its severity and attack surface.
3. **Remediation & Review:** A fix is developed in a private security branch and peer-reviewed by project maintainers.
4. **Release:** The patch is merged into the `main` branch and deployed to the official production static build.
5. **Credit & Disclosure:** When appropriate, credit is attributed to the reporter in the release notes (unless anonymity is requested), and a public security advisory is published.

---

## 4. Responsible Disclosure Guidelines

We ask security researchers and community contributors to adhere to the principles of responsible vulnerability disclosure:

- Allow maintainers a reasonable opportunity to investigate, patch, and release a fix before publishing any technical details or proofs of concept.
- Make a good-faith effort to avoid privacy violations, data loss, and disruptions to users during research.
- Do not exploit a detected vulnerability beyond the minimum necessary to verify its existence.
- Refrain from accessing, modifying, or retaining any data that does not belong to you.

---

## 5. Scope

### In-Scope
The following assets and components are in-scope for security evaluations:
- The **CodeOrbit web application** source code (`index.html`, `assets/css/*`, `assets/js/*`), the service worker (`sw.js`) and the app manifest (`manifest.webmanifest`).
- The two third-party scripts as CodeOrbit loads them (Chart.js and Lucide from jsDelivr, pinned with Subresource Integrity, see D-011), and how `sw.js` caches them.
- Official repository configuration files and issue/PR templates (`.github/`).
- GitHub Actions CI/CD workflows (`.github/workflows/*`).
- The official live static deployment: `https://letscook-organization.github.io/CodeOrbit/`.
- How data is saved and restored (the `localStorage` data, and checking backup files on restore). A backup file is untrusted input: anything in it that can run code or reach the page as HTML or a link is in scope.

### Out-of-Scope
The following categories are generally **not** considered security vulnerabilities and should not be reported via the security advisory channel:
- Standard user-interface bugs, layout quirks, or styling defects (report via [GitHub Issues](https://github.com/LetsCook-Organization/CodeOrbit/issues)).
- Feature requests or enhancements.
- Scenarios requiring physical, unrestricted access to an already unlocked user device.
- Attacks relying on social engineering against maintainers or users.
- Vulnerabilities solely present in end-of-life, unsupported web browsers.
- Distributed Denial of Service (DDoS) against third-party hosting providers or CDNs (GitHub Pages, jsDelivr).

*(Note: We do not dismiss valid security reports merely because they involve a third-party dependency used by the application).*

---

## 6. Privacy & Sensitive Information

When submitting a security report, please respect personal privacy:
- **Do not include real credentials, passwords, or personal user data** in logs or screenshots.
- Use sanitized dummy values (e.g., `user@example.com`, `dummy-token-12345`) for proof of concepts.
- Any sensitive information shared in security reports will be kept strictly confidential by project maintainers.

---

## 7. Security Contact Information

For any questions, security concerns, or confidential vulnerability reports:

- **Organization:** LET'S COOK — THE FOUNDRY
- **Primary Security Email:** [foundry@letscook.co.in](mailto:foundry@letscook.co.in)
- **GitHub Repository:** [https://github.com/LetsCook-Organization/CodeOrbit](https://github.com/LetsCook-Organization/CodeOrbit)
- **Security Advisories:** [https://github.com/LetsCook-Organization/CodeOrbit/security/advisories](https://github.com/LetsCook-Organization/CodeOrbit/security/advisories)

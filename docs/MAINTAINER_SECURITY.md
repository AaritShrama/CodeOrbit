# CodeOrbit — Maintainer Security Guidance & Checklist

**Organization:** LET'S COOK — THE FOUNDRY  
**Target Repository:** `LetsCook-Organization/CodeOrbit`  
**Document Classification:** Maintainer Administrative Guidelines  

> [!IMPORTANT]
> **Checklist & Guidance Notice:** This document is an administrative security guide and recommendation checklist for repository administrators and organization owners. These controls are configured through GitHub's official web settings interface and are not automatically enabled by repository files alone.

---

## 1. Administrative Access Control Roles

GitHub provides granular permission tiers. To enforce the principle of least privilege, organization members and repository contributors should be assigned only the minimal permissions necessary for their responsibilities:

| Role | Scope & Permissions | Recommended Assignment |
| :--- | :--- | :--- |
| **Organization Owner** | Complete administrative control over the GitHub organization: billing, member access, repo creation/deletion, organization-wide 2FA enforcement, and security policies. | Strictly limited to primary organizational founders (minimum 2 owners for redundancy, but kept minimal). |
| **Repository Administrator** | Full administrative rights over the specific repository: managing branch protection rules, configuring Webhooks/Secrets, managing collaborator access, and renaming/transferring. | Assigned only to senior project technical leads actively maintaining repository operations. |
| **Maintainer** | Can manage repository issues, pull requests, milestones, labels, and some settings without having administrative permissions over repository deletion or sensitive settings. | Core contributors actively triaging community contributions and guiding development. |
| **Write Contributor** | Can push to non-protected topic branches, open and review pull requests, create milestones, and manage issues. | Regular active developers contributing code features and bug fixes. |
| **Read-Only / Triage** | Read access to public source code and issues. Triage members can manage issue labels and close/reopen issues without write access to source code. | Community moderators, apprentice contributors, and public users. |

> [!TIP]
> **Least Privilege Practice:** Administrative access (`Owner` and `Admin`) must never be granted for convenience. Always grant `Maintainer` or `Write` access to contributors unless repository-level configuration changes are strictly required.

---

## 2. Maintainer Account Security Checklist

Every maintainer with write or administrative access to the repository represents an entry point. Maintainers must maintain personal account hygiene:

- [ ] **Two-Factor Authentication (2FA):** Enable hardware security keys (FIDO2/WebAuthn like YubiKey) or a secure TOTP authenticator app (e.g., 1Password, Bitwarden, Google Authenticator). Disable SMS-based 2FA where possible.
- [ ] **Strong, Unique Password:** Use a password manager to generate and store a high-entropy passphrase (minimum 16+ characters). Never reuse passwords across services.
- [ ] **Secure Recovery Methods:** Download and securely store GitHub recovery codes in a secure, encrypted vault offline.
- [ ] **Active Session Auditing:** Periodically review active sessions under **GitHub Settings $\rightarrow$ Sessions** and revoke unfamiliar devices or stale browser logins.
- [ ] **OAuth & Personal Access Token Review:** Periodically audit authorized applications under **GitHub Settings $\rightarrow$ Applications** and revoke unneeded Personal Access Tokens (PATs) or expired integrations.
- [ ] **SSH & GPG Signing Keys:** Use modern Ed25519 SSH keys with passphrases. Enable commit signing (GPG or SSH signing) so your commits display GitHub's "Verified" badge.

---

## 3. GitHub Organization Security Checklist

Organization owners should configure organization-level security baselines under **Organization Settings**:

- [ ] **Require Two-Factor Authentication:** Enable **"Require two-factor authentication for everyone in the organization"** under Organization Settings $\rightarrow$ Authentication Security.
- [ ] **Limit Organization Owner Count:** Restrict the `Owner` role to 2–3 trusted organizational leads. All other contributors should belong to teams with repository-specific permissions.
- [ ] **Base Permissions Set to "No Permissions" or "Read":** Prevent automatic write access across all organization repositories for new members.
- [ ] **Periodic Membership Audit:** Conduct quarterly reviews of organization members and outside collaborators. Immediately remove access for inactive members or individuals who leave the organization.
- [ ] **Audit Log Monitoring:** Regularly review the organization audit log under **Settings $\rightarrow$ Audit Log** for unexpected permission escalations or repository visibility changes.

---

## 4. Repository Branch Protection Checklist

To protect the integrity of the production codebase, direct pushes to the primary branch must be disabled. Configure a branch protection rule for `main` under **Repository Settings $\rightarrow$ Branches**:

- [ ] **Require a Pull Request Before Merging:** Disable direct pushes to `main`. All changes must arrive via a pull request.
- [ ] **Require Approvals:** Require at least **1 approving review** from a maintainer before a pull request can be merged.
- [ ] **Dismiss Stale Pull Request Approvals:** Automatically revoke previous approvals when new commits are pushed to an open pull request.
- [ ] **Require Status Checks to Pass:** Require CI workflows (e.g., lint and test workflows) to pass before merging.
- [ ] **Require Branches to be Up to Date:** Ensure changes are tested against the latest `main` commit prior to merge.
- [ ] **Restrict Who Can Dismiss Reviews:** Limit review dismissal privileges to repository administrators.
- [ ] **Do Not Allow Force Pushes:** Explicitly block `git push --force` on `main` to preserve an immutable commit history.
- [ ] **Do Not Allow Deletions:** Prevent the `main` branch from being accidentally deleted.

---

## 5. GitHub Secrets & Credential Management

- [ ] **Zero Secrets in Code:** Never commit API keys, cloud access tokens, passwords, or deployment keys directly into repository files.
- [ ] **Use GitHub Actions Secrets:** Store sensitive parameters strictly in **Settings $\rightarrow$ Secrets and Variables $\rightarrow$ Actions**.
- [ ] **Scope Secrets Appropriately:** Restrict deployment secrets to specific production environments (e.g., `github-pages`) rather than repository-wide or organization-wide exposure.
- [ ] **Incident Credential Rotation:** If a token or key is ever committed or exposed, immediately consider it compromised:
  1. Revoke the token at the source provider immediately.
  2. Issue a replacement credential and update GitHub Secrets.
  3. Review audit logs to verify whether the exposed token was exploited during the exposure window.

---

## 6. Pull Request & Supply Chain Security

Untrusted contributor code and third-party dependencies can introduce supply chain risks. Follow these review standards:

- [ ] **Inspect GitHub Actions Workflow Changes:** Always inspect pull requests that modify `.github/workflows/` files. Ensure no untrusted script execution or secrets exposure is introduced.
- [ ] **Avoid `pull_request_target` with Untrusted Code:** Never check out untrusted pull request code with elevated repository secrets.
- [ ] **Review External Scripts & Dependencies:** CodeOrbit loads only two pinned, SRI-checked scripts from jsDelivr (Chart.js and Lucide); fonts are served from the repo. Thoroughly inspect any pull requests proposing new external CDN scripts or npm libraries.
- [ ] **Enforce Sanitization in PR Reviews:** Verify that any new DOM rendering logic uses `escapeHTML()` and safe URL protocol checks (`http://`, `https://`) to prevent Cross-Site Scripting (XSS).

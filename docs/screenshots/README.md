# Screenshots Plan

This directory is reserved for optional screenshots used in README, GitHub Releases, and portfolio pages.

No screenshot files are required for the application to run.

---

## Recommended screenshot set for v2.42-local

| Screenshot | Purpose |
|---|---|
| `01-workspace-upload.png` | Upload workspace with loading/error UX states. |
| `02-overview-dashboard.png` | Executive summary, summary cards, severity distribution, parse stats. |
| `03-investigation-findings.png` | Findings / incidents / timeline with filters. |
| `04-investigation-entities.png` | Investigation entities bounded table. |
| `05-triage-review.png` | Triage, case notes, review readiness, closure checklist. |
| `06-evidence-pack.png` | Evidence Pack preview, quality score, guardrails, share safety. |
| `07-markdown-report.png` | Markdown report preview and download actions. |
| `08-mobile-responsive.png` | 390px or narrow mobile layout. |

---

## Capture guidance

- Use `docker compose up --build` for a reproducible local demo.
- Prefer `samples/demo_access.log` for the first screenshot pass.
- Avoid showing real IPs, usernames, tokens, private hostnames, or raw customer logs.
- Capture both Chinese and English only if needed; Chinese-first screenshots are acceptable for this repository.
- Keep screenshot filenames stable so README/portfolio references do not break.

---

## Current status

The repository does not require screenshots as release assets. This directory documents a recommended capture plan only.

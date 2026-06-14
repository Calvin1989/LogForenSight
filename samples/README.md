# Sample Logs

The `samples/` directory contains synthetic or demo-safe logs for local testing and portfolio demonstrations.

---

## Recommended order

1. `demo_access.log`
   - Best first demo.
   - Exercises parsing, findings, incidents, investigation entities, timeline, explainability, triage, review readiness, and Evidence Pack export.

2. `demo_batch_part1.log` + `demo_batch_part2.log`
   - Demonstrates multi-file batch analysis.
   - Useful for source file attribution and cross-file aggregation.

3. `nginx_access_sample.log`
   - Lightweight Nginx parser smoke check.

4. `apache_access_sample.log`
   - Lightweight Apache parser smoke check.

---

## Demo safety

- Samples are intended for local demos and tests.
- Do not replace them with real customer logs.
- Do not add secrets, production hostnames, tokens, private paths, or personally identifiable information.
- If new samples are added, keep them small, deterministic, and easy to explain.

---

## v2.42-local UX checks

The latest frontend includes loading/error and unavailable-state UX. Useful smoke scenarios:

- Run analysis with no file selected.
- Stop the backend and attempt analysis to observe backend-unavailable messaging.
- Upload an empty or unsupported file to verify structured error callouts.
- Open Evidence Pack before a successful analysis and confirm actions are disabled but visible.
- Open Markdown report without required data and confirm unavailable helpers are shown.

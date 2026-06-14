# Demo Guide

This guide demonstrates LogForenSight v2.42-local in 5-10 minutes: upload logs, review findings/incidents, inspect entities and explanations, triage results, add case notes, check readiness, and export an Evidence Pack.

---

## 1. Start the app

```powershell
docker compose up --build
```

Open:

```text
http://localhost:5173
```

For development mode:

```powershell
cd backend
uvicorn app.main:app --reload
```

```powershell
cd frontend
npm run dev
```

---

## 2. Recommended sample files

| Sample | Use |
|---|---|
| `samples/demo_access.log` | Best first demo for single-file analysis. |
| `samples/demo_batch_part1.log` + `samples/demo_batch_part2.log` | Multi-file batch analysis and source attribution. |
| `samples/nginx_access_sample.log` | Parser smoke check for Nginx-style logs. |
| `samples/apache_access_sample.log` | Parser smoke check for Apache-style logs. |

All sample data is synthetic/demo-safe and uses reserved/example-style indicators where applicable.

---

## 3. Main demo path

1. **Upload logs**
   - Select `samples/demo_access.log`.
   - Confirm the Analyze button enters loading state and results render without leaving the page.

2. **Overview**
   - Show executive summary, risk score, request count, source IP count, incident count, severity distribution, and parse stats.
   - Explain that LogForenSight uses deterministic local rules rather than an external LLM.

3. **Investigation views**
   - Open findings, incidents, and timeline.
   - Show filters, severity labels, timestamps, evidence snippets, and compact status metadata.

4. **Investigation Entities**
   - Show extracted IPs, paths, HTTP methods, HTTP status codes, URLs/accounts when present, and source files.
   - Emphasize bounded table behavior for large cases.

5. **Detection Explainability**
   - Expand a finding.
   - Highlight rule context, matched field, matched indicator, evidence, related entities, and recommended action.

6. **Triage / Review**
   - Mark one finding or incident as Investigating or Mitigated.
   - Add priority and notes.
   - Show empty-state / disabled-state behavior if no data is available.

7. **Case Notes**
   - Add an Observation, Hypothesis, Action, or Decision.
   - Confirm the inline save feedback appears without layout jump.

8. **Review Readiness and Case Closure**
   - Show readiness summary, checklist, evidence gaps, and next actions.
   - Confirm checklist, gaps, and next actions are sibling sections, not nested cards.

9. **Evidence Pack**
   - Open Evidence Pack preview.
   - Show quality score, guardrails, share-safety review, copy buttons, and disabled/unavailable states where applicable.
   - Download or copy the Markdown handoff.

10. **Markdown Report**
    - Show report preview, bounded code/pre sections, and sanitized report availability.
    - If data is unavailable, show the structured unavailable banner.

11. **Language and responsive check**
    - Toggle Chinese/English.
    - Optionally check 390px/768px widths to show mobile-safe wrapping and button stacking.

---

## 4. Failure-state demo

v2.42-local adds UX coverage for failure and unavailable states. You can demonstrate:

- Analyze with no file selected → muted helper guidance.
- Backend unavailable → structured error callout.
- Unsupported or empty file → clear error title, reason, and retry hint.
- Evidence Pack before analysis → actions remain visible but disabled with helper text.
- Markdown report without raw data → unavailable banner and disabled download.

Avoid browser alerts in the demo; all user-facing feedback should be inline and recoverable.

---

## 5. Suggested talk track

> “LogForenSight is a local-first security log triage workbench. It parses access logs, applies deterministic detection rules, explains findings, aggregates incidents, extracts investigation entities, and lets an analyst triage and export a Markdown Evidence Pack without sending sensitive logs to external services.”

Key points:

- Local-first and deterministic.
- Explainable findings.
- Analyst workflow, not just detection output.
- Evidence Pack handoff.
- Productized frontend with loading/error/empty/disabled states.

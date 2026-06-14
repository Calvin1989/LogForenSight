# Portfolio Notes — LogForenSight

LogForenSight is a strong portfolio project because it combines security domain reasoning, deterministic backend analysis, frontend product design, export workflows, and release discipline.

---

## One-liner

A local-first security log triage workbench that turns Web access logs into explainable findings, aggregated incidents, investigation entities, analyst triage, case notes, readiness checks, and Markdown Evidence Packs.

---

## What to highlight

### 1. Security engineering

- Nginx / Apache log parsing.
- Deterministic detection rules.
- Incident aggregation.
- IOC / investigation entity extraction.
- Detection explainability.
- Rule coverage and rule tuning surfaces.

### 2. Analyst workflow design

- Workspace history and saved cases.
- Findings/incidents/timeline views.
- Triage status, priority, and notes.
- Case notes / decision log.
- Review readiness, closure checklist, evidence gaps, and next actions.
- Evidence Pack export.

### 3. Product-quality frontend

- Vue 3 + Vite + shadcn-vue primitives.
- Dashboard-oriented layout and compact status rows.
- Bounded scroll containers for long evidence/report content.
- Empty/loading/error/disabled states.
- Accessibility labels and disabled semantics.
- Responsive behavior for desktop, tablet, and mobile.

### 4. Release engineering

- GitHub PR workflow.
- CI backend/frontend/docker checks.
- Local release readiness gates.
- Annotated tags and GitHub Releases.
- Regression tests for layout, UX, smoke, i18n, export, and storage.

---

## Suggested demo sequence

1. Start with `docker compose up --build`.
2. Upload `samples/demo_access.log`.
3. Show overview metrics and risk summary.
4. Inspect findings and incidents.
5. Expand detection explainability.
6. Show investigation entities.
7. Add triage state and a case note.
8. Review readiness and case closure sections.
9. Open Evidence Pack preview, guardrails, quality score, and share-safety review.
10. Copy or download the Markdown handoff.
11. Trigger one unavailable/error state to show product completeness.

---

## Current stable baseline

- Stable release: `v2.42-local`
- Backend tests: 65 passed
- Frontend tests: 51 files / 368 tests passed
- Build: passed
- Docker Compose config: valid
- Latest focus: analysis error/loading states + smoke guards

---

## Interview framing

Useful framing:

> “I intentionally kept detection deterministic and local-first. The interesting engineering problem was not calling an AI model; it was building a trustworthy analyst workflow: parse quality, explainability, triage state, case notes, review readiness, export guardrails, and release-level regression coverage.”

Avoid overstating:

- It is not a production SIEM.
- It is not a real-time detection pipeline.
- It is not a hosted SaaS product.
- It does not require or use LLMs for core detection.

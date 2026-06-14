# GitHub Listing Guidance

This file provides recommended repository metadata for LogForenSight.

---

## Suggested Description

Local-first security log triage workbench for deterministic detection, explainable findings, analyst review, and Markdown Evidence Pack export.

## Suggested Topics

```text
security-tools
log-analysis
incident-response
dfir
threat-hunting
ioc-extraction
detection-engineering
fastapi
vue
vite
shadcn-vue
local-first
```

---

## Short Project Summary

LogForenSight is a local-first Web access log analysis tool. It parses Nginx / Apache logs, applies deterministic security rules, aggregates incidents, extracts investigation entities, explains findings, supports analyst triage and case notes, and exports Markdown Evidence Packs for handoff and review.

---

## Portfolio Bullets

- Built a FastAPI + Vue 3 security analysis workbench with deterministic detection and local-first privacy boundaries.
- Designed an analyst workflow covering findings, incidents, timeline, investigation entities, triage, case notes, review readiness, and Evidence Pack export.
- Migrated the frontend to shadcn-vue primitives and refined the UI into a dashboard-oriented investigation cockpit.
- Added UX polish for loading/error/unavailable states, accessibility, responsive layouts, bounded long content, and regression tests.
- Maintained a strict release gate: backend tests, frontend tests, Vite build, Docker Compose config, whitespace checks, and clean git status.

---

## Release Snapshot Naming

Recommended archive naming:

```text
LogForenSight-v2.42-local-<shortsha>.zip
```

For the current release:

```text
LogForenSight-v2.42-local-dabaaa2.zip
```

---

## Current Release Summary

`v2.42-local` improves analysis loading and error states, keeps unavailable Evidence Pack / Markdown actions visible but disabled, adds recent-analysis status metadata, and expands smoke regression coverage.

Validation snapshot:

- Backend: 65 tests passed
- Frontend: 51 files / 368 tests passed
- Build: passed
- Docker Compose config: valid

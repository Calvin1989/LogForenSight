# Agent Workflow Guardrails — LogForenSight

This document defines repository-specific operating rules for agents working on LogForenSight.

---

## 1. Repository Context

- LogForenSight is a local-first security log triage tool.
- Backend: Python / FastAPI / Pydantic.
- Frontend: Vue 3 / Vite / npm / shadcn-vue primitives.
- Latest documented release: `v2.42-local`.
- Current frontend includes dashboard layout, UX feedback states, accessibility polish, bounded scroll panels, and regression tests.
- The project is intentionally local-first: no database, no external API, no LLM dependency in the core detection path.

---

## 2. Default Operating Mode

- Start with a read-only boundary check before editing:

```powershell
git status --short --branch
git log --oneline --decorate -8
git diff --check
```

- Prefer a planning gate before code changes.
- Do not perform Git write operations unless explicitly instructed by the user:
  - no `git add`, `git commit`, `git branch`, `git switch`, `git checkout`, `git reset`, `git stash`, `git push`
  - no PR creation, tag creation, or release creation
- Never use `git add .`; stage precise paths only.
- Keep changes cohesive enough for a version-sized PR.
- Avoid broad, goal-less CSS sweeps.

---

## 3. Forbidden by Default

| Area | Rule |
|---|---|
| Dependencies | No `npm install`, package changes, lockfile changes, or alternate package managers unless explicitly requested. |
| shadcn-vue | Do not reinitialize shadcn-vue or run `npx shadcn-vue init`; existing primitives are already in place. |
| UI primitives | Do not rewrite `frontend/src/components/ui/**` unless the task targets the design system. |
| Backend/API | Do not change `backend/**`, schemas, API contracts, or parser/detector behavior unless scoped. |
| Docker/config/samples | Do not change Docker, config, or samples unless scoped. |
| Export/Markdown utilities | Do not change export/share/Markdown generation utilities unless explicitly scoped. |
| i18n | `frontend/src/i18n.js` may be changed only when adding required bilingual UI copy; additive-only is preferred. |
| Docs | Change docs only when requested. |
| Skills/tools | Do not commit `.agents/`, `skills-lock.json`, impeccable/taste-skill local installation files, or one-off tool state. |

---

## 4. Validation Gates

### 4.1 Standard Gate

```powershell
cd D:\Program\prof\GithubProject\LogForenSight

git diff --check

cd backend
python -m pytest

cd ..\frontend
npm run test
npm run build

cd ..
docker compose config
git status --short --branch
```

### 4.2 Forbidden Diff Gate

```powershell
git diff --name-only -- backend docker-compose.yml config samples frontend/src/utils frontend/src/composables frontend/package.json frontend/package-lock.json package.json package-lock.json README.md AGENTS.md CHANGELOG.md .github docs .agents skills-lock.json
```

If `frontend/src/i18n.js` is intentionally changed, verify it is additive-only and bilingual.

### 4.3 Current Release Baseline

For `v2.42-local`:

- Backend: 65 tests passed.
- Frontend: 51 files / 368 tests passed.
- Frontend build passed.
- Docker Compose config valid.
- Working tree clean at release.

---

## 5. Release Workflow

1. Confirm `main...origin/main` is clean.
2. Confirm target tag does not already exist.
3. Run the full standard gate.
4. Create a feature branch and PR for changes.
5. Wait for GitHub checks to pass.
6. Merge PR.
7. Sync local `main`.
8. Run release readiness gate again.
9. Create an annotated tag:

```powershell
git tag -a vX.Y-local -m "vX.Y-local"
git push origin vX.Y-local
```

10. Create GitHub Release with scope, validation, and notes.
11. Confirm:

```powershell
git tag --points-at HEAD
gh release view vX.Y-local --json tagName,name,isDraft,isPrerelease,url
git status --short --branch
```

---

## 6. Frontend Change Guidance

Allowed for scoped frontend UX/UI work:

- `frontend/src/App.vue`
- `frontend/src/components/*.vue`
- `frontend/src/styles/globals.css`
- `frontend/src/__tests__/*.test.js`
- `frontend/src/i18n.js` when adding required bilingual UI copy

Preserve existing regression coverage:

- `layoutRegression.test.js`
- `uxRegression.test.js`
- `smokeRegression.test.js`
- component-specific tests for Evidence Pack, Markdown, Triage, Case Closure, Findings, Incidents, Timeline, Workspace, and i18n

When polishing UI:

- keep long evidence/report content inside bounded scroll containers
- keep case-closure checklist, evidence gaps, and next actions as sibling sections
- keep Evidence Pack copy/export/download actions visible but correctly disabled when unavailable
- keep focus/disabled/aria behavior meaningful
- do not hide important information just to reduce page height

---

## 7. Documentation Guidance

When docs are explicitly requested:

- Update `README.md` current version, validation counts, and feature summary.
- Update `CHANGELOG.md` and `docs/release_notes.md` with the latest release scope.
- Update `docs/demo.md`, `docs/architecture.md`, `docs/portfolio.md`, and `docs/github_listing.md` if product positioning changed.
- Keep docs truthful: do not claim screenshots, automation, or hosted services that are not present.

---

*Last updated for v2.42-local.*

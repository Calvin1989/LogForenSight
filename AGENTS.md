# Agent Workflow Guardrails — LogForenSight

This document defines agent operating rules, validation gates, forbidden actions, and release workflow for the LogForenSight repository.

---

## 1. Repository Context

- **LogForenSight** is a Vue 3 / Vite frontend + Python (FastAPI) backend forensics tool.
- Primary local workflow uses **Windows PowerShell** on win32.
- The frontend already has an existing **shadcn-vue Card primitive** under `frontend/src/components/ui/card/`.
- **Do not** reinitialize shadcn-vue, replace the Card primitive, or run `npx shadcn-vue init`.
- The project uses **npm** for frontend dependency management. Do not introduce alternate package managers.

---

## 2. Default Agent Operating Mode

- **Start every task** with boundary checks: `git status --short --branch`, `git log --oneline --decorate -8`.
- **Prefer a Planning Gate** before any code changes: read-only assessment, risk table, file allowlist.
- **Do not perform Git write operations** unless the user explicitly instructs:
  - No `git add`, `git commit`, `git branch`, `git switch`, `git checkout`, `git reset`, `git stash`, `git push`.
  - No PR creation, no tag creation, no release operations.
- **Preserve user preference**: accumulate coherent, larger-version-sized batches before commit/PR/push/release.
- **Use precise path-based `git add`** only when explicitly authorized — never `git add .`.
- When modifying files, **prefer editing existing files** over creating new ones.

---

## 3. Forbidden by Default

The following are forbidden unless the task **explicitly targets** that area:

| Category | Forbidden Actions |
|---|---|
| **Dependencies** | No `npm install`, no package/lockfile changes, no new packages |
| **shadcn CLI** | No `npx shadcn-vue`, no `npx shadcn`, no `shadcn-vue@latest`, no `shadcn@latest` |
| **Card Primitive** | No modifications to `frontend/src/components/ui/card/**` |
| **App.vue** | No changes to `frontend/src/App.vue` without explicit Planning Gate approval |
| **Backend** | No `backend/**`, `docker-compose.yml`, or API changes unless task targets backend |
| **Config** | No changes to `vite.config.*`, `tailwind.config.*`, `postcss.config.*` unless scoped |
| **Export/Share/Markdown** | No workflow-critical changes to download, export, or markdown generation logic unless explicitly scoped |
| **Git Writes** | No add/commit/branch/switch/checkout/reset/stash/push/PR/tag/release |
| **Lockfiles** | No `package.json`, `package-lock.json`, `frontend/package.json`, `frontend/package-lock.json` |
| **Docs** | No `README.md` changes unless explicitly requested |

---

## 4. Validation Gates

### 4.1 Boundary Check (run at task start)

```powershell
cd D:\Program\prof\GithubProject\LogForenSight
git status --short --branch
git log --oneline --decorate -8
git diff --check
```

### 4.2 Pre-Commit Gate (run before any commit)

```powershell
cd D:\Program\prof\GithubProject\LogForenSight
git status --short --branch
git diff --name-only
git diff --check
```

### 4.3 Test & Build Gate

```powershell
# Backend tests
cd D:\Program\prof\GithubProject\LogForenSight\backend
python -m pytest

# Frontend tests
cd D:\Program\prof\GithubProject\LogForenSight\frontend
npm run test
npm run build

# Docker config validation
cd D:\Program\prof\GithubProject\LogForenSight
docker compose config
```

### 4.4 Dependency Sanity Check

```powershell
git grep -n "shadcn-vue@latest"
git grep -n "shadcn@latest"
```

The first two should return **zero matches**. Additionally, verify that no alternate package manager lockfiles exist in the repository root or `frontend/` — both checks should return **False**.

---

## 5. Release Process

1. **Preconditions**: main is clean, local validation passes, GitHub CI is green, user has explicitly approved.
2. **Tag preference**: use annotated tags (`git tag -a`) for new releases unless a lightweight tag pattern already exists.
3. **Never delete or rewrite** already-pushed release tags without explicit user approval.
4. **Release record** should include:
   - Scope (what changed)
   - Validation results (tests, build, grep checks)
   - Excluded areas (what was intentionally skipped)

---

## 6. Card Migration Lessons (v2.32 — v2.36)

- The shadcn-vue **Card primitive is stable** and battle-tested across 20 components.
- Card migration is **complete** for all core display/list/summary panels:
  - SummaryCards, SeverityDistribution, ParseStatsCard, TopList
  - FindingsList, IncidentsList, TimelineView, RuleCoverage
  - ExecutiveSummary, FindingExplainability, InvestigationEntities
  - AnalysisContextBar, ReviewReadinessPanel, RuleConfigPanel
  - CaseClosureChecklist, CaseClosureEvidenceGaps, CaseClosureNextActions
  - EvidencePackExportGuardrails, EvidencePackQualityScore, EvidencePackShareSafety
- **Remaining components should NOT be force-migrated** to Card without a fresh Planning Gate.
- Remaining workflow-heavy components (CaseNotesPanel, CaseWorkspace, TriagePanel, RuleTuningPanel) need **separate design themes** — they are form/editor components, not display cards.
- MarkdownReport and EvidencePackExportPreview are **export-critical** — Card migration risks disrupting download/export UX.

---

## 7. Future v2.37 Candidate Themes

The following are **candidates only** — no theme has been selected yet. A Planning Gate must choose one before Phase 1 begins.

| Theme | Scope | Risk |
|---|---|---|
| **Workflow Primitives** | CaseNotesPanel, CaseWorkspace, TriagePanel, RuleTuningPanel — shadcn Button/Input/Select/Textarea | Medium |
| **Report & Export Polish** | MarkdownReport, EvidencePackExportPreview — preview UX, download flow refinement | High |
| **Workspace Layout Polish** | WorkspaceShell, WorkspaceNav, LanguageToggle — layout/nav primitives | Low |
| **Interaction Panels Polish** | ReportComparison, RecentAnalyses — selection/display UX | Low |

---

## 8. File Change Boundaries

### Allowed for docs-only tasks
- `AGENTS.md`
- `docs/**`

### Allowed for frontend component tasks (with Planning Gate)
- `frontend/src/components/*.vue`
- `frontend/src/__tests__/*.test.js`
- `frontend/src/utils/*.js` (read-only reference unless scoped)

### Requires explicit approval
- `frontend/src/App.vue`
- `frontend/src/components/ui/**`
- `frontend/src/composables/**`
- `frontend/src/i18n.js`
- `backend/**`
- `docker-compose.yml`
- `package.json` / `package-lock.json`

---

*Last updated: v2.37-local Phase 0 — Agent Workflow Guardrails*

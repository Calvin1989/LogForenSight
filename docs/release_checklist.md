# Release Checklist

This checklist documents the local release workflow used by LogForenSight.

---

## 1. Preconditions

- [ ] Work is on a feature branch.
- [ ] Scope is clear and documented.
- [ ] No unrelated files are modified.
- [ ] No package or lockfile changes unless explicitly planned.
- [ ] No `.agents/`, `skills-lock.json`, or local tool state is staged.
- [ ] No release tag already exists for the target version.

```powershell
git status --short --branch
git log --oneline --decorate -8
git tag --list "v2.*"
```

---

## 2. Local Validation Gate

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

For v2.42-local the gate was:

- backend 65 passed
- frontend 51 files / 368 tests passed
- build passed
- Docker Compose config valid
- git diff --check clean

---

## 3. Forbidden Diff Gate

Run before commit and before release:

```powershell
git diff --name-only -- backend docker-compose.yml config samples frontend/src/utils frontend/src/composables frontend/package.json frontend/package-lock.json package.json package-lock.json README.md AGENTS.md CHANGELOG.md .github docs .agents skills-lock.json
```

Expected: no output unless the release intentionally targets one of those areas.

If `frontend/src/i18n.js` changes, verify:

- new keys are additive-only
- zh/en both exist
- keys are used
- no existing keys are deleted or modified

---

## 4. Commit and PR

Use precise staging. Do not use `git add .`.

```powershell
git add <specific-path-1>
git add <specific-path-2>
git diff --cached --check
git diff --cached --name-only
git commit -m "<type(scope): summary>"
git push -u origin <branch>
```

Create PR:

```powershell
gh pr create --base main --head <branch> --title "<title>" --body-file -
gh pr view --json number,state,mergeable,headRefName,baseRefName,title,url
gh pr checks --watch
```

---

## 5. Merge

When PR is mergeable and checks pass:

```powershell
gh pr merge <number> --merge --delete-branch
```

Then sync local main:

```powershell
git switch main
git fetch --prune
git status --short --branch
git log --oneline --decorate -5
```

If `gh pr merge` already fast-forwarded local `main`, a later `git pull --ff-only origin main` may be unnecessary.

---

## 6. Release Readiness Gate

Run the full validation gate again on `main` after merge.

Also confirm target tag is absent:

```powershell
git tag --list "vX.Y-local"
```

---

## 7. Tag and GitHub Release

Create annotated tag:

```powershell
git tag -a vX.Y-local -m "vX.Y-local"
git push origin vX.Y-local
```

Create release:

```powershell
gh release create vX.Y-local --title "vX.Y-local" --notes-file -
```

Confirm:

```powershell
git tag --points-at HEAD
gh release view vX.Y-local --json tagName,name,isDraft,isPrerelease,url
git status --short --branch
git log --oneline --decorate -5
```

---

## 8. Release Notes Requirements

Release notes should include:

- Summary of changes
- Validation results
- Explicit notes on no dependency/package/backend/Docker changes where true
- i18n additive-only note where applicable
- No claim of screenshots or assets unless included

---

## 9. Troubleshooting

- If `gh release view` says release not found after tag creation, create the GitHub Release for the existing tag; do not recreate the tag.
- If `git ls-remote` fails due to TLS, retry or rely on `git push origin <tag>` / `gh release create` confirmation.
- If frontend tests pass locally but CI fails, inspect CI logs before changing tests.

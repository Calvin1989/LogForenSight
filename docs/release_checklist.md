# Release Checklist

本清单用于确保 **LogForenSight** 的本地优先发布流程保持稳定、可复核、可回滚。

---

## 1. Baseline

- [ ] 从干净的 `main` 创建发布分支。
- [ ] 执行 `git fetch --prune origin`、`git fetch --tags origin`、`git pull --ff-only origin main`。
- [ ] 确认 `git status` 干净，禁止在脏工作树上开始版本迭代。
- [ ] 记录当前 `main` 的 `HEAD`、稳定 tag、release asset 名称与目标版本号。

```powershell
git switch main
git fetch --prune origin
git fetch --tags origin
git pull --ff-only origin main
git status
git log --oneline --decorate -5
git tag --list "v2.*"
git switch -c chore/<release-branch>
```

## 2. Repo Hygiene

- [ ] 不使用 `git add .`，只精确暂存本次实际修改文件。
- [ ] 检查旧仓库名 / 旧项目名残留。
- [ ] 仅修改本次版本允许的文件和范围，不顺手做全仓库格式化。
- [ ] 提交前执行 `git diff --check` 与 `git diff --cached --check`。

```powershell
git grep -n "<legacy-repo-slug>"
git grep -n "<legacy-project-name>"
git grep -n "<legacy-short-name>"
git grep -n "<legacy-owner>/<legacy-repo-slug>"
git diff --check
git diff --cached --check
```

## 3. Validation

- [ ] 后端测试通过：`cd backend && python -m pytest`。
- [ ] 前端测试通过：`cd frontend && npm run test`。
- [ ] 前端构建通过：`cd frontend && npm run build`。
- [ ] Docker Compose 配置校验通过：`docker compose config`。
- [ ] 提交后执行 `git show --check --stat HEAD`，确认无空白错误且提交范围正确。

```powershell
cd backend
python -m pytest

cd ..\frontend
npm run test
npm run build

cd ..
docker compose config
git diff --check
git show --check --stat HEAD
```

## 4. Staging And Commit

- [ ] 用 `git diff --stat` 和目标文件级 diff 复核改动范围。
- [ ] 只按文件逐个 `git add`。
- [ ] 用清晰、低风险的提交信息描述本次发布主题。
- [ ] 提交后再次确认 `git status`。

```powershell
git diff --stat
git diff -- .github/workflows/ci.yml docs/release_checklist.md README.md CHANGELOG.md docs/release_notes.md .gitignore

git add .github/workflows/ci.yml
git add docs/release_checklist.md
git add README.md
git add CHANGELOG.md docs/release_notes.md
git add .gitignore

git diff --cached --stat
git diff --cached --check
git commit -m "chore: <release summary>"
git show --check --stat HEAD
git status
```

如果本次未修改 `.gitignore`，则不要执行对应的 `git add .gitignore`。

## 5. PR And Merge

- [ ] 推送发布分支到 `origin`。
- [ ] 创建 PR，并在正文中附上 backend / frontend / docker / git 验证结果。
- [ ] 合并前确认 PR 描述与实际 diff 一致。
- [ ] 合并后保留分支或删除分支，按本次发布策略执行。

```powershell
git push -u origin chore/<release-branch>
gh pr create --base main --head chore/<release-branch> --title "<title>"
gh pr merge --merge --delete-branch=false
```

## 6. Tag And Archive

- [ ] 回到 `main` 后再次执行完整验证，确保合并结果仍然稳定。
- [ ] 创建并推送版本 tag。
- [ ] 生成发布归档 zip，并包含 `PROJECT_STATE.txt`。
- [ ] 检查归档内是否包含错误条目或不应打包的内容。
- [ ] 生成并核对归档 `SHA256`。

```powershell
git fetch origin
git switch main
git pull --ff-only origin main

git tag vX.Y-local
git push origin vX.Y-local
```

归档检查要求：

- [ ] zip 文件名与版本、提交哈希一致。
- [ ] 归档中包含 `PROJECT_STATE.txt`。
- [ ] 不包含明显错误条目，如缓存、临时文件、无关构建产物或本地 IDE 垃圾文件。
- [ ] `SHA256` 已记录，可用于 Release 附件校验。

## 7. GitHub Release

- [ ] 在 GitHub 创建 Release，标题、tag、说明与 `CHANGELOG.md` / `docs/release_notes.md` 保持一致。
- [ ] 上传 zip 与 `SHA256` 信息。
- [ ] 确认 Release 页面中的版本主题、验证结论和运行时兼容性描述准确。

## 8. Post-release Check

- [ ] 再次执行 `git status`，确认工作树干净。
- [ ] 检查本地 `main`、远端 `origin/main` 与 tag 已同步。
- [ ] 检查 GitHub Actions、Release 页面和仓库首页链接正常。
- [ ] 记录 PR 编号、`main HEAD`、tag 推送状态、修改文件清单与最终验证结果。

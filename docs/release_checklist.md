# Release Checklist

This checklist ensures that the **AI Log Security Analyzer** is stable and ready for release.

## 1. Backend Verification
- [ ] **Unit & API Tests**: Run `python -m pytest` in `backend/` and ensure all tests pass.
- [ ] **CLI Tool (Raw)**: Run `python -m app.cli ../samples/nginx_access_sample.log` and verify `security_report.md` is generated.
- [ ] **CLI Tool (Sanitized)**: Run `python -m app.cli ../samples/nginx_access_sample.log --sanitized --output security_report_sanitized.md` and verify the output.
- [ ] **Dependencies**: Ensure `backend/requirements.txt` is up to date.

## 2. Frontend Verification
- [ ] **Unit Tests**: Run `npm run test` in `frontend/` and ensure all tests pass.
- [ ] **Build Process**: Run `npm run build` in `frontend/` and ensure it completes without errors.
- [ ] **Vite Proxy**: Verify that `npm run dev` correctly proxies requests to the local backend (8000).

## 3. Docker Verification
- [ ] **Docker Compose Build**: Run `docker compose build` to ensure all images build correctly.
- [ ] **Docker Compose Run**: Run `docker compose up` and verify:
    - Frontend is accessible at `http://localhost:5173`.
    - Backend is accessible at `http://localhost:8000`.
    - Log analysis works correctly via the Web UI.
- [ ] **Docker Config**: Run `docker compose config` to check for syntax errors.

## 4. Manual UI/UX Verification
- [ ] **File Upload**: Test uploading valid and invalid (too large, wrong extension) files.
- [ ] **Analysis View**: Verify Summary Cards, Executive Summary (v1.6), Report Comparison (v1.7), Incidents List, Top IPs/Paths, and Findings List are rendered correctly.
- [ ] **Report Comparison (v1.7)**:
    - [ ] Verify that comparison can be performed between any two Recent Analyses.
    - [ ] Verify that Risk Score Delta, Severity Changes, and Finding/Incident Changes are calculated correctly.
    - [ ] Verify that "Download Comparison MD" generates a valid Markdown file.
    - [ ] Verify that comparison works even if one report is missing fields (executive_summary, incidents, etc.).
- [ ] **Executive Summary (v1.6)**:
    - [ ] Verify Risk Score (0-100) and Risk Level are calculated correctly based on findings.
    - [ ] Verify "Download MD" button generates a separate Markdown file.
    - [ ] Verify the summary is deterministic (same input -> same output).
    - [ ] Verify methodology note explicitly mentions "No LLM".
- [ ] **Rule Match Details**: Verify that Findings show matched details (Count, Fields, Values) and expansion/collapse works.
- [ ] **Legacy Data Compatibility**: Verify that Recent Analyses records without matched_* fields still render safely (no UI crashes).
- [ ] **Parse Stats**: Verify that the Parsing Quality card shows correct stats (Total/Parsed/Skipped).
- [ ] **Attack Timeline**: 
    - [ ] Verify Timeline View renders events in chronological order.
    - [ ] Verify Severity and IP filters work correctly.
    - [ ] Verify Evidence expansion in the timeline.
    - [ ] Verify timeline events are properly sanitized in the sanitized report.
- [ ] **Skipped Samples**: Verify that Skipped Line Samples are displayed if the log contains malformed lines (use `nginx_access_sample.log`).
- [ ] **Markdown Report**: Verify the "Show/Hide Preview" button works.
- [ ] **Downloads**: Verify both "Download Report" and "Download Sanitized" trigger correct file downloads.
- [ ] **Analyst Workflow Exports**:
    - [ ] Export Filtered Incidents (JSON/CSV)
    - [ ] Export Filtered Findings (JSON/CSV)
    - [ ] Export Analysis Summary (JSON)
    - [ ] Check CSV formatting (correct columns, escaping of special characters)
- [ ] **Clear Current Result**: Verify "Clear Current Result" works as expected (resets UI but preserves local history).
- [ ] **Bilingual UI (v1.7.1)**:
    - [ ] Verify that clicking "中文" switches UI to Chinese.
    - [ ] Verify that clicking "English" switches UI to English.
    - [ ] Verify that the language preference persists after page refresh (via `localStorage`).
    - [ ] Verify that all major components (Summary, Findings, Incidents, Timeline, etc.) are translated.
    - [ ] Verify that "Report Comparison" narrative and Markdown export are correctly localized.
    - [ ] Verify that severity levels (High/Medium/Low) and risk levels are translated.
    - [ ] Verify that recent analyses statistics (parsed, incidents, findings) are translated.

## 5. Security & Privacy (Sanitization)
- [ ] **IP Redaction**: Ensure public IPs are masked (e.g., `1.2.x.x`) in the sanitized report and Executive Summary.
- [ ] **Secret Redaction**: Ensure `token`, `password`, and `Authorization` headers are masked in the sanitized report and Executive Summary.
- [ ] **Rule Match Sanitization**: Ensure `matched_values` are properly sanitized in the sanitized report.
- [ ] **Skipped Sample Sanitization**: Verify that the sanitized report does not expose full IPs or secrets in the "Skipped Line Samples" section.

## 7. Pre-GitHub Release (Final Polish)
- [ ] **Project Identity**:
    - [ ] `README.md` positioning is clear and professional.
    - [ ] `Why this project is different` section highlights local-first and rule-based approach.
    - [ ] `Current local milestone` is updated to `v1.7-local`.
- [ ] **Standard Files**:
    - [ ] `CHANGELOG.md` exists and covers v1.0 to v1.7.
    - [ ] `LICENSE` (MIT) exists with correct copyright holder.
    - [ ] `.gitattributes` is configured for LF line endings.
- [ ] **Documentation completeness**:
    - [ ] `architecture.md` includes the data flow diagram.
    - [ ] `demo.md` includes the 5-minute demo script.
- [ ] **Verification**:
    - [ ] All CI checks are passing locally.
    - [ ] `docker compose config` is valid.
    - [ ] Frontend production build is successful (`npm run build`).
    - [ ] `rule_coverage` API field is present in responses.
    - [ ] Untriggered rules are visible in Rule Coverage panel.
    - [ ] Sample evidence in Rule Coverage is correctly sanitized.
    - [ ] Chinese/English toggle works for Rule Coverage UI and report section.
- [ ] **Sanitized Review**:
    - [ ] Manually review a generated sanitized report to ensure no leaks of real IPs or secrets from the sample logs.
- [ ] **Git Hygiene**:
    - [ ] No large files or `__pycache__` committed.
    - [ ] Local commit only (no push).

## Post-Commit Check (v1.8)

- [ ] `git status` shows clean.
- [ ] `git log` shows `feat: add rule coverage explainability`.
- [ ] All tests pass in clean environment.

## 8. Post-Release (Future)
- [ ] Create GitHub Release tag.
- [ ] Upload Docker images to Registry (optional).

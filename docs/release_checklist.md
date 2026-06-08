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
- [ ] **Analysis View**: Verify Summary Cards, Incidents List, Top IPs/Paths, and Findings List are rendered correctly.
- [ ] **Parse Stats**: Verify that the Parsing Quality card shows correct stats (Total/Parsed/Skipped).
- [ ] **Skipped Samples**: Verify that Skipped Line Samples are displayed if the log contains malformed lines (use `nginx_access_sample.log`).
- [ ] **Markdown Report**: Verify the "Show/Hide Preview" button works.
- [ ] **Downloads**: Verify both "Download Report" and "Download Sanitized" trigger correct file downloads.

## 5. Security & Privacy (Sanitization)
- [ ] **IP Redaction**: Ensure public IPs are masked (e.g., `1.2.x.x`) in the sanitized report.
- [ ] **Secret Redaction**: Ensure `token`, `password`, and `Authorization` headers are masked in the sanitized report.
- [ ] **Skipped Sample Sanitization**: Verify that the sanitized report does not expose full IPs or secrets in the "Skipped Line Samples" section.

## 6. Pre-GitHub Cleanup
- [ ] **Exclusion Check**: Ensure the following are NOT committed:
    - `frontend/node_modules/`
    - `frontend/dist/`
    - `backend/__pycache__/`
    - `backend/.pytest_cache/`
    - `backend/.venv/`
    - `backend/security_report.md`
    - `backend/security_report_sanitized.md`
    - `.env` files
- [ ] **CI Status**: Ensure GitHub Actions CI workflow (if applicable) is passing for the latest commit.
- [ ] **Documentation**: Ensure `README.md` and `docs/` are clear and professional.

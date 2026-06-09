# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v2.2.1-local] - 2026-06-09
### Fixed
- **Test Output Cleanup**: Muted expected `console.error` during malformed JSON tests and suppressed jsdom navigation warnings in triage export tests.
- **Test Robustness**: Enhanced mocks for `URL.createObjectURL` and anchor elements to ensure stable export testing across environments.

## [v2.2-local] - 2026-06-09
### Added
- **Analyst Triage Workflow**: Introduced a dedicated triage panel for findings and incidents.
- **Triage State Persistence**: Local storage of triage status (Open, Investigating, Mitigated, False Positive), priority, and notes.
- **Triage Metrics Summary**: Real-time summary of triage progress (e.g., open counts, critical priority counts).
- **Markdown Triage Export**: Support for exporting a structured triage summary report for documentation or handoff.
- **Triage-to-Case Linkage**: Triage states are automatically linked to saved cases via `caseId`, ensuring continuity.
- **Tests**: Added Vitest coverage for `triageStorage` and `TriagePanel` component.
- **Bilingual Support**: Full Chinese and English translations for all triage-related labels and statuses.

## [v2.1-local] - 2026-06-09
### Added
- **Saved Case Workspace**: A dedicated local workspace to save, browse, search, and manage analysis cases.
- **Manual Save Workflow**: Added "Save as Case" button to analysis results with custom title and metadata support.
- **Case Management UI**: Support for searching by title/tags, filtering by risk level, and deleting cases.
- **Import/Export for Cases**: Support for exporting saved cases to JSON files and importing them back, enabling case portability.
- **Snapshot Storage**: Optimized result snapshotting that avoids storing raw logs or `File` objects to ensure privacy.
- **Tests**: Comprehensive Vitest coverage for case storage utilities, workspace UI components, and i18n keys.
- **Documentation**: Updated architecture, demo, and release notes to reflect the new local-first workspace capabilities.

## [v2.0-local] - 2026-06-09
### Added
- **Multi-file Batch Analysis Backend**: Added combined case analysis for multiple uploaded log files through `POST /api/analyze/batch`.
- **Frontend Multi-file Upload Flow**: Added batch upload support and recent-history labeling for case-level analyses.
- **Per-source Parsing Details**: Added `analysis_mode` and `source_files` metadata so the UI can display source attribution and per-file parse quality.
- **Batch-aware Rule Tuning UX**: Added guidance that temporary rule tuning in batch mode applies to the entire uploaded set.
- **Tests**: Added backend and frontend coverage for batch analysis, source file stats, history labels, and batch UI behavior.

## [v1.9-local] - 2026-06-08
### Added
- **Rule Tuning UI**: A new panel to temporarily adjust rule parameters (thresholds, sensitive paths, user-agents) in the frontend.
- **Per-request Rule Overrides**: Backend support for overriding detection rules for a single analysis request without modifying config files.
- **Tuned Analysis Endpoint**: Added `POST /api/analyze/tuned` to handle multipart uploads with rule overrides.
- **Rule Coverage Integration**: Tuned rules are reflected in the Rule Coverage view, including enabled/disabled status.
- **Interactive UI**: Real-time feedback and re-analysis capabilities to observe the impact of threshold changes.

## [v1.8.1-local] - 2026-06-08
### Changed
- **Repository Polish**: Enhanced README with professional badges and structured project positioning.
- **Documentation Overhaul**: Added `docs/portfolio.md` for technical deep-dives and `docs/release_notes.md` for version history.
- **Demo Script Refinement**: Updated `docs/demo.md` with a complete 5-8 minute showcase walkthrough.
- **Presentation Improvements**: Refined project descriptions to highlight local-first and zero-infra advantages.

## [v1.8-local] - 2026-06-08
### Added
- Rule Coverage section to show which rules were applied and triggered.
- Detection Explainability with detailed explanations for each rule.
- `rule_coverage` field in `AnalysisResult` API response.
- Frontend `RuleCoverage` component with filtering and export options.
- Sanitized rule coverage evidence and matched values.
- Localized Rule Coverage section in Chinese reports.

## [v1.7.1-local] - 2026-06-08
### Added
- **Frontend Bilingual UI Toggle**: Support for switching between Chinese and English UI.
- **Persistent Language Preference**: User's language choice is saved in browser `localStorage`.
- **Zero-Dependency i18n**: Lightweight, custom i18n implementation without third-party libraries.
- **Refined Comparison Narrative**: Localized narrative summaries in Report Comparison based on selected language.

## [v1.7-local] - 2026-06-08
### Added
- **Report Comparison**: Compare two analysis results from the Recent Analyses history.
- **Severity Delta**: Visual tracking of changes in severity distribution (Critical, High, Medium, Low).
- **Finding/Incident Change Tracking**: Identify added, removed, and unchanged risks between reports.
- **Comparison Markdown Export**: Generate and download a comprehensive comparison report.
- **Improved History Compatibility**: Graceful handling of older analysis records with missing metadata.

## [v1.6-local] - 2026-06-08
### Added
- **Executive Summary**: A high-level, deterministic security summary designed for management or portfolio presentation.
- **Deterministic Risk Scoring**: A rule-based risk score (0-100) and risk level (Critical to Informational).
- **Executive Report Integration**: The summary is now included at the top of the Markdown report and can be downloaded separately.
- **Sanitized Summary**: Full support for redaction of sensitive data in the executive summary.

## [v1.4-local] - 2026-06-08
### Added
- **Attack Timeline View**: A chronological narrative of security events, allowing analysts to trace attacker movements.
- **Timeline Filtering**: Support for filtering timeline events by severity and source IP.
- **Evidence Expansion**: Detailed log evidence snippets within the timeline view.
- **Sanitized Timeline**: Ensuring timeline events are properly redacted in the sanitized report.

## [v1.3-local] - 2026-05-20
### Added
- **Analyst Workflow Exports**: Support for exporting filtered Findings and Incidents to CSV and JSON.
- **Summary JSON Export**: A machine-readable summary of analysis metrics.
- **Evidence Management**: Support for expanding/collapsing long lists of evidence in the UI.
- **Security Warnings**: Clear indicators when exporting raw data that may contain sensitive information.

## [v1.2-local] - 2026-05-05
### Added
- **Severity Distribution**: Visual breakdown of High, Medium, and Low risks for both Findings and Incidents.
- **Local History**: Persistent storage of the last 5 analysis results using browser `localStorage`.
- **Parsing Quality Metrics**: Detailed statistics on parsing success rate and skipped line samples.
- **UI Refinements**: Improved layout for summary cards and filtering controls.

## [v1.1-local] - 2026-04-15
### Added
- **Rule Match Details**: Enhanced explainability with match counts, fields, and values for every finding.
- **Sanitized Sharing**: Redaction engine for IP addresses and sensitive query parameters.
- **Markdown Reporting**: Automated generation of professional security reports with preview and download.
- **Rule-based Detection**: Core engine for identifying common web attacks (Path Traversal, SQLi, etc.).

## [v1.0-local] - 2026-03-25
### Added
- **Local-first MVP**: Basic log parsing for Nginx and Apache formats.
- **Incident Aggregation**: Initial logic for grouping findings by source IP.
- **Web UI**: Simple dashboard for file upload and results display.
- **CLI Tool**: Command-line interface for local log analysis.

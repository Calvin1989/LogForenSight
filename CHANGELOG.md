# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
## [v2.10-local] - 2026-06-09
### Added
- **Curated Demo Sample Logs**: Added `samples/demo_access.log`, `samples/demo_batch_part1.log`, and `samples/demo_batch_part2.log` to provide a stable local demo path for parsing, findings, incidents, investigation entities, explainability, triage, and evidence export.
- **Samples README**: Added `samples/README.md` to document the recommended upload order, sample purpose, and data-safety boundaries for local demos.

### Changed
- **Demo Guide Refresh**: Updated `docs/demo.md` with a Chinese-first recommended demo path, explicit sample selection guidance, and a clearer walkthrough for the full analyst workflow.
- **README Demo Hint**: Added a lightweight README note that points users to the `samples/` directory for the quickest end-to-end demo experience.
- **Runtime Compatibility**: Documentation-only and sample-only release with no frontend behavior change, no backend behavior change, no dependency change, and no parser/detector logic change.

## [v2.9.2-local] - 2026-06-09
### Changed
- **README First-screen Visual Polish**: Refined the README hero area with a more distinctive positioning line, richer badges, and a faster first-screen summary for GitHub visitors.
- **Visual Rhythm Improvements**: Added emoji-based section rhythm, a feature highlight table, a more prominent quick start block, and a documentation navigation table while preserving the Chinese-first documentation style.
- **Workflow Diagram**: Added a Mermaid workflow diagram to show the path from log upload to deterministic detection, triage, saved cases, and analyst evidence export.
- **Runtime Compatibility**: Documentation-only patch with no frontend behavior change, no backend behavior change, no dependency change, and no runtime logic change.

## [v2.9.1-local] - 2026-06-09
### Changed
- **README Chinese-first Restoration**: Restored `README.md` to a Chinese-first project documentation style with the project body led by Chinese sections instead of a GitHub listing-centric English structure.
- **Discoverability Keywords Preserved**: Kept concise English keywords such as `security log analysis`, `incident response`, `threat hunting`, and `ioc extraction` in appropriate places to preserve GitHub discoverability.
- **Runtime Compatibility**: Documentation-only patch with no frontend behavior change, no backend behavior change, no dependency change, and no runtime logic change.

## [v2.9-local] - 2026-06-09
### Changed
- **Triage UX Status Summary**: Added a bilingual triage status summary with explicit `Open / Investigating / Mitigated / False Positive` counts and a `No triage records yet` / `暂无处置记录` fallback for empty cases.
- **Needs Review Prompt**: Added lightweight `Needs review` / `待复核` indicators in Findings and Incidents so analysts can spot items without triage or still marked as open.
- **Triage Metadata Visibility**: Surfaced `Last updated` and `Analyst note` hints from the existing local triage state without changing backend behavior or the stored triage schema.
- **Compatibility**: Preserved the existing local-first triage storage key and did not introduce any storage key migration or backend API change.

### Tests
- **Frontend Coverage**: Expanded `TriagePanel`, `FindingsList`, `IncidentsList`, `triageStorage`, and `i18n` tests to cover status summary aggregation, empty-state fallback, needs-review visibility, and triage metadata rendering.

## [v2.8-local] - 2026-06-09
### Changed
- **Analyst Evidence Pack Metadata Polish**: Enhanced the Markdown evidence pack header with a formal `Case metadata` summary, including product/export type, generated timestamp, case identifiers, analysis scope, source files, and analysis counts when available.
- **Local-first Privacy Note**: Added an explicit privacy note to the evidence pack to clarify that export remains local-first and does not depend on external APIs, cloud services, databases, or LLMs.
- **Validation Summary**: Added a compact validation-oriented section that explains deterministic local rules, explainability inclusion, triage inclusion, evidence source, and raw log exposure boundaries.

### Tests
- **Evidence Pack Coverage**: Expanded `evidencePackExport` tests to verify the new metadata, privacy, validation, and fallback behavior without weakening existing assertions for investigation entities, explainability, and triage sections.

## [v2.7-local] - 2026-06-09
### Changed
- **GitHub Discoverability Polish**: Refined repository-facing documentation to describe LogForenSight as a local-first security log triage workflow with IOC extraction, detection explainability, and analyst evidence pack export.
- **README Positioning**: Reworked the README for faster GitHub scanning, clearer audience targeting, portfolio-ready messaging, and more natural security/DFIR keyword coverage.
- **Portfolio / Demo / Screenshot Docs**: Updated `docs/portfolio.md`, `docs/demo.md`, and `docs/screenshots/README.md` to reflect the current analyst workflow from parsing to evidence export.
- **Repository Listing Metadata Guidance**: Added `docs/github_listing.md` with suggested GitHub description, topics, short project summary, portfolio bullets, and release snapshot naming guidance.

### Documentation
- **Release Notes Refresh**: Updated release-facing documentation to reflect the v2.7-local GitHub readiness goal without changing application behavior or business logic.

### Added
- **Detection Explainability Drilldown (v2.6)**: Per-finding local-first explanation panel in the `Security Findings` / `安全风险点` area, including rule context, severity rationale, matched field/message context, matched indicator/keyword/regex hints, evidence snippet (with truncation marker), severity-aware recommended analyst action, and related investigation entities. Implemented as a pure-function utility (`findingExplainability.js`) and a small `FindingExplainability.vue` component, both fully covered by Vitest.
- **Explainability in Analyst Evidence Pack**: Added a new `Detection Explainability` / `检测可解释性` chapter to the Analyst Evidence Pack Markdown export, with stable structure and `Not available` / `暂无数据` fallbacks.
- **Bilingual UI/i18n Coverage**: New `explainability.*` and `findings.showExplanation` / `findings.hideExplanation` translation keys for both Chinese and English, with dedicated i18n tests.
- **Tests and Validation**: Added Vitest coverage for `findingExplainability`, `FindingExplainability` component, drilldown toggle inside `FindingsList`, and the new Evidence Pack section. Total frontend test count is now 154 (up from 141). Backend tests unchanged at 65.
- **Analyst Evidence Pack Export**: Added a local-first Markdown evidence pack export for the current analysis result, designed for analyst handoff and ticket workflows.
- **Evidence Pack Content Reuse**: Reused existing findings, incidents, timeline, rule coverage, parse stats, batch source file metadata, triage state, and saved case metadata when available.
- **Bilingual Export Entry**: Added `Download Evidence Pack` / `下载证据包` in the report area with i18n coverage and missing-data fallbacks.
- **v2.5 IOC / Investigation Entities Extraction**: Added local-first extraction for IPv4 addresses, usernames/accounts, URLs, file paths/request paths, HTTP methods, HTTP status codes, and batch source files from findings, incidents, timeline events, and report context.
- **Investigation Entities UI**: Added a lightweight `Investigation Entities` / `调查实体` section to the analysis results view with deduplication, counts, first/last seen timestamps, related source files, and stable sorting.
- **Evidence Enrichment**: Added an `Investigation entities` chapter to the Analyst Evidence Pack Markdown export with `Not available` / `暂无数据` fallbacks when no entities can be extracted.
- **Tests and i18n Coverage**: Added Vitest coverage for IOC extraction, UI fallback, Evidence Pack integration, and bilingual labels for the new investigation entity feature.

## [v2.2.2-local] - 2026-06-09
### Added
- **Windows Port Troubleshooting**: Added documentation for resolving port 8000 conflicts (WinError 10013) on Windows systems.
- **Alternative Startup Guide**: Documented safe alternate backend port (18080) and instructions for proxy adjustment.

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

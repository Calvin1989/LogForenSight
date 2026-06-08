# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

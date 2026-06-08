# Project Architecture

The **AI Log Security Analyzer** is built with a clean, layered architecture to ensure maintainability and scalability.

## Backend (Python/FastAPI)

The backend is structured into several layers, each with a specific responsibility:

- **`app/parser.py`**: Handles log parsing. It supports both Nginx and Apache Combined log formats, with built-in auto-detection logic. It converts raw lines into structured `LogEntry` objects, skipping lines that don't match the expected patterns. It also provides parsing quality metrics (e.g., parse rate, skipped lines).
- **`app/detector.py`**: The core detection engine. It evaluates `LogEntry` objects against rule-based logic (frequency, sensitive paths, suspicious UAs, etc.) and generates granular `Finding` objects. Each finding includes structured match details (count, fields, and values) for better explainability.
- **`app/config_loader.py`**: Responsible for loading and merging security rules from external YAML files into the `DetectorConfig` object used by the engine.
- **`app/incident.py`**: The aggregation layer. It groups related `Findings` by source IP and behavioral patterns to create high-level `Incidents`. This layer provides context, intent analysis, and unified recommendations for security analysts.
- **`app/rule_coverage.py`**: Summarizes rule application, triggered status, and provides detection explanations for transparency.
- **`app/timeline.py`**: The timeline generation layer. It builds a chronological sequence of security events (`TimelineEvent`) by correlating logs, findings, and incidents, providing a narrative of the attack progression.
- **`app/executive_summary.py`**: The high-level summarization layer (v1.6). It generates a deterministic, rule-based summary including risk scores and level (critical to informational) for management presentation, without using LLMs or external APIs.
- **`app/sanitizer.py`**: The data redaction layer. It provides functions to sanitize IP addresses, query parameters, and Authorization headers from analysis results, enabling safe sharing of security reports.
- **`app/report.py`**: A dedicated rendering layer that takes the analysis results (Summary, Incidents, Findings) and formats them into a structured Markdown report.
- **`app/schemas.py`**: Defines data contracts using Pydantic models. These models ensure consistent data structures between the backend and frontend.
- **`app/service.py`**: The unified business entry point. It orchestrates the flow from parsing and detection to incident aggregation, reporting, and rule coverage analysis. It also handles final data aggregation for the `AnalysisSummary`, such as calculating severity distributions.
- **`app/main.py`**: The FastAPI API layer. It provides RESTful endpoints (e.g., `/api/analyze`) for the frontend to consume.
- **`app/cli.py`**: A command-line interface for running the analysis directly from the terminal.

## Frontend (Vue 3/Vite)

The frontend is a modern SPA (Single Page Application) focused on simplicity and usability:

- **Component-Based**: The UI is broken down into reusable components (e.g., `FileUpload.vue`, `IncidentsList.vue`, `FindingsList.vue`, `RuleCoverage.vue`) located in `src/components/`.
- **State Management**: Uses Vue 3's Composition API. Analysis-related state and methods are encapsulated in `src/composables/useAnalysisState.js` to keep `App.vue` clean and focused on layout.
- **API Client**: `src/api.js` centralizes all HTTP communication with the backend.
- **Local History**: `src/utils/historyStorage.js` manages persistent storage of recent analysis results in `localStorage`.
- **Export Utilities**: `src/utils/exportUtils.js` provides pure frontend functions for converting data to CSV/JSON and triggering browser downloads.
- **Responsive Design**: Uses plain CSS with Flexbox and Grid to ensure the interface works well across different screen sizes.

## Data Flow

```text
[ Log File ] 
      |
      v
[ app/parser.py ] ----> ( LogEntry Objects + Metrics )
      |
      v
[ app/detector.py ] --> ( Rule-based Findings )
      |
      v
[ app/incident.py ] --> ( Aggregated Incidents )
      |
      v
[ app/timeline.py ] --> ( Chronological Timeline Events )
      |
      v
[ app/executive_summary.py ] --> ( Risk Score & Level )
      |
      v
[ app/rule_coverage.py ] ------> ( Rule Application & Explanations )
      |
      v
[ app/service.py ] ---> ( Final AnalysisResult )
      |
      +----------------------------+----------------------------+
      |                            |                            |
      v                            v                            v
[ app/report.py ]          [ app/sanitizer.py ]          [ app/main.py ]
      |                            |                            |
      v                            v                            v
( Markdown Report )       ( Redacted Results )          ( REST API JSON )
      |                            |                            |
      +----------------------------+----------------------------+
                                   |
                                   v
                          [ Frontend (Vue 3) ]
                                   |
                +------------------+------------------+
                |                  |                  |
                v                  v                  v
          [ components ]    [ composables ]    [ utils/exportUtils ]
          ( UI Display )    ( State Mgmt )     ( CSV/JSON Export )
                                   |
                                   v
                         [ utils/historyStorage ]
                          ( Local Persistence )
```

1. **Upload**: User selects a log file in the Vue frontend.
2. **Request**: Frontend sends the file to the FastAPI `/api/analyze` endpoint.
3. **Orchestration**: `main.py` calls `service.py` to start the analysis.
4. **Parsing & Detection**: `service.py` triggers `parser.py` and `detector.py` to generate rule-based findings.
5. **Aggregation & Timeline**: `incident.py` groups findings into high-level incidents, and `timeline.py` builds a chronological view of all security events.
6. **Rule Coverage**: `rule_coverage.py` maps the configuration and results back to the rule set for explainability.
7. **Reporting**: `report.py` generates the comprehensive Markdown summary.
8. **Response**: Backend returns an `AnalysisResult` JSON containing summary, incidents, findings, coverage, and the report.
   - *Optional*: If the user requests a sanitized report, `sanitizer.py` is called to redact sensitive data from the final `AnalysisResult` before it is sent back or used for report generation.
9. **Display**: Frontend renders the data into cards, tables, and a preview.

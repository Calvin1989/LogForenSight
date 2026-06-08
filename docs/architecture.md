# Project Architecture

The **AI Log Security Analyzer** is built with a clean, layered architecture to ensure maintainability and scalability.

## Backend (Python/FastAPI)

The backend is structured into several layers, each with a specific responsibility:

- **`app/parser.py`**: Handles log parsing. It supports both Nginx and Apache Combined log formats, with built-in auto-detection logic. It converts raw lines into structured `LogEntry` objects, skipping lines that don't match the expected patterns. It also provides parsing quality metrics (e.g., parse rate, skipped lines).
- **`app/detector.py`**: The core detection engine. It evaluates `LogEntry` objects against rule-based logic (frequency, sensitive paths, suspicious UAs, etc.) and generates granular `Finding` objects.
- **`app/config_loader.py`**: Responsible for loading and merging security rules from external YAML files into the `DetectorConfig` object used by the engine.
- **`app/incident.py`**: The aggregation layer. It groups related `Findings` by source IP and behavioral patterns to create high-level `Incidents`. This layer provides context, intent analysis, and unified recommendations for security analysts.
- **`app/sanitizer.py`**: The data redaction layer. It provides functions to sanitize IP addresses, query parameters, and Authorization headers from analysis results, enabling safe sharing of security reports.
- **`app/report.py`**: A dedicated rendering layer that takes the analysis results (Summary, Incidents, Findings) and formats them into a structured Markdown report.
- **`app/schemas.py`**: Defines data contracts using Pydantic models. These models ensure consistent data structures between the backend and frontend.
- **`app/service.py`**: The unified business entry point. It orchestrates the flow from parsing and detection to incident aggregation and reporting.
- **`app/main.py`**: The FastAPI API layer. It provides RESTful endpoints (e.g., `/api/analyze`) for the frontend to consume.
- **`app/cli.py`**: A command-line interface for running the analysis directly from the terminal.

## Frontend (Vue 3/Vite)

The frontend is a modern SPA (Single Page Application) focused on simplicity and usability:

- **Component-Based**: The UI is broken down into reusable components (e.g., `FileUpload.vue`, `IncidentsList.vue`, `FindingsList.vue`) located in `src/components/`.
- **State Management**: Uses Vue 3's Composition API. Analysis-related state and methods are encapsulated in `src/composables/useAnalysisState.js` to keep `App.vue` clean and focused on layout.
- **API Client**: `src/api.js` centralizes all HTTP communication with the backend.
- **Local History**: `src/utils/historyStorage.js` manages persistent storage of recent analysis results in `localStorage`.
- **Responsive Design**: Uses plain CSS with Flexbox and Grid to ensure the interface works well across different screen sizes.

## Data Flow

1. **Upload**: User selects a log file in the Vue frontend.
2. **Request**: Frontend sends the file to the FastAPI `/api/analyze` endpoint.
3. **Orchestration**: `main.py` calls `service.py` to start the analysis.
4. **Parsing & Detection**: `service.py` triggers `parser.py` and `detector.py` to generate rule-based findings.
5. **Aggregation**: `incident.py` processes the findings to group them into meaningful security incidents.
6. **Reporting**: `report.py` generates the comprehensive Markdown summary.
7. **Response**: Backend returns an `AnalysisResult` JSON containing summary, incidents, findings, and the report.
   - *Optional*: If the user requests a sanitized report, `sanitizer.py` is called to redact sensitive data from the final `AnalysisResult` before it is sent back or used for report generation.
8. **Display**: Frontend renders the data into cards, tables, and a preview.

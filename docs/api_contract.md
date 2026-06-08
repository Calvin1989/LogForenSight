# API Contract

This document defines the interface between the Backend (FastAPI) and the Frontend (Vue 3).

## 0. Security & CORS
The API supports Cross-Origin Resource Sharing (CORS) for the following origins:
- `http://localhost:5173` (Vite Default)
- `http://127.0.0.1:5173`

- **Endpoint:** `GET /api/rules`
- **Response Structure:**
```json
{
  "high_frequency_threshold": 10,
  "path_scanning_404_threshold": 5,
  "sensitive_paths": ["/.env", "/admin"],
  "suspicious_user_agents": ["sqlmap", "nikto"],
  "source": "/config/rules.yaml"
}
```

## 1. Health Check
Check if the API service is running.

- **Endpoint:** `GET /healthz`
- **Response:** `{"status": "ok"}`

## 2. Analyze Log
Analyzes Nginx log content via file upload and returns structured findings and aggregated incidents.

- **Endpoint:** `POST /api/analyze`
- **Content-Type:** `multipart/form-data`
- **Accepted Extensions:** `.log`, `.txt`
- **Max File Size:** 5MB
- **Form Parameters:**
    - `file`: The log file to be analyzed.
    - `log_format`: (Optional) `auto`, `nginx`, or `apache`. Default is `auto`.
- **Configuration:** Detection rules can be customized via the `RULES_FILE` environment variable on the server side (pointing to a YAML file).

## 3. Analyze Log (Sanitized)
Analyzes Nginx log content via file upload and returns a sanitized result (IPs and secrets redacted).

- **Endpoint:** `POST /api/analyze/sanitized`
- **Content-Type:** `multipart/form-data`
- **Accepted Extensions:** `.log`, `.txt`
- **Max File Size:** 5MB
- **Response Structure:** Identical to `/api/analyze`, but content is redacted.

### Request Parameters
- `file`: The log file to be analyzed (Field name: `file`).

### Success Response (200 OK)
Returns an `AnalysisResult` JSON object.

```json
{
  "summary": {
    "total_requests": 23,
    "unique_ips": 5,
    "total_4xx": 8,
    "total_5xx": 0,
    "top_ips": [
      { "ip": "192.168.1.100", "count": 11 }
    ],
    "top_paths": [
      { "path": "/login", "count": 11 }
    ],
    "finding_severity_counts": {
      "high": 2,
      "medium": 1,
      "low": 0
    },
    "incident_severity_counts": {
      "high": 1,
      "medium": 0,
      "low": 0
    }
  },
  "timeline_events": [
    {
      "event_id": "e1f2g3h4",
      "timestamp": "01/Jun/2026:10:00:01",
      "source_ip": "1.2.3.4",
      "event_type": "path_probe",
      "severity": "high",
      "title": "Sensitive Path Probe: /.env",
      "description": "IP 1.2.3.4 attempted to access sensitive path /.env.",
      "related_rule_id": "sensitive_path_probe",
      "related_incident_id": "a1b2c3d4",
      "evidence": "1.2.3.4 - - [01/Jun/2026:10:00:01 +0000] \"GET /.env HTTP/1.1\" 404 ..."
    }
  ],
  "parse_stats": {
    "total_lines": 25,
    "parsed_lines": 23,
    "skipped_lines": 2,
    "parse_rate": 0.92,
    "requested_format": "auto",
    "detected_format": "combined",
    "skipped_samples": [
      {
        "line_number": 5,
        "content": "malformed log line content...",
        "reason": "unmatched_log_format"
      }
    ]
  },
  "incidents": [
    {
      "incident_id": "a1b2c3d4",
      "title": "Directory Scanning Incident",
      "severity": "high",
      "source_ip": "1.2.3.4",
      "summary": "IP 1.2.3.4 is attempting to discover hidden directories (high 404 error rate).",
      "related_rule_ids": ["path_scanning"],
      "evidence": ["Total 404 errors from this IP: 6"],
      "recommendations": ["Block this IP and investigate the target paths."],
      "confidence": "high"
    }
  ],
  "findings": [
    {
      "rule_id": "path_scanning",
      "title": "Path Scanning Detected",
      "severity": "high",
      "description": "IP 1.2.3.4 generated 6 404 errors, indicating potential directory scanning.",
      "recommendation": "Block this IP and investigate the target paths.",
      "evidence": ["Total 404 errors from this IP: 6"],
      "metadata": { "ip": "1.2.3.4", "count": 6 },
      "matched_count": 6,
      "matched_fields": ["ip", "status"],
      "matched_values": ["1.2.3.4", "404"]
    }
  ],
  "executive_summary": {
    "overall_risk_level": "high",
    "risk_score": 75,
    "headline": "High-risk suspicious access patterns detected",
    "overview": "Security analysis identified 1 incidents and 1 risk findings across 23 requests. Immediate attention is recommended to address high-severity threats and prevent potential compromise.",
    "key_metrics": [
      "Total Requests Analyzed: 23",
      "Unique Source IPs: 5",
      "Security Incidents Detected: 1",
      "Individual Security Risks: 1",
      "Timeline Events Recorded: 1"
    ],
    "key_affected_ips": ["1.2.3.4"],
    "top_risks": ["Directory Scanning Incident (Incident)", "Path Scanning Detected (Finding)"],
    "recommended_next_steps": [
      "Review and investigate all critical/high severity incidents immediately.",
      "Block top offending source IPs at the firewall or WAF level.",
      "Inspect affected application paths for vulnerabilities or misconfigurations.",
      "Rotate exposed tokens or credentials if sensitive parameters appeared in logs.",
      "Preserve analyzed logs for further incident response and auditing."
    ],
    "methodology": "Deterministic summary generated from local rule findings, incidents, severity distribution, and timeline events. No LLM or external API is used."
  },
  "report_markdown": "# AI Log Security Analysis Report\n..."
}
```

## Data Models

### Executive Summary (New v1.6)
A high-level deterministic summary designed for management or portfolio presentation.
- `overall_risk_level`: `informational`, `low`, `medium`, `high`, or `critical`.
- `risk_score`: Integer (0-100) representing the aggregated risk level.
- `headline`: A concise headline describing the security status.
- `overview`: A human-readable summary of the analysis results.
- `key_metrics`: List of important metrics (counts of requests, IPs, incidents, etc.).
- `key_affected_ips`: List of top source IPs involved in security findings.
- `top_risks`: List of the most significant incidents or findings detected.
- `recommended_next_steps`: List of actionable remediation items.
- `methodology`: Fixed statement explaining the deterministic nature of the summary (no LLM).

### Incident
Aggregated security events grouped by Source IP.
- `incident_id`: Unique identifier for the incident.
- `title`: High-level title of the incident.
- `severity`: `low`, `medium`, or `high`.
- `source_ip`: The IP address responsible for the incident.
- `summary`: A concise description of the aggregated activity.
- `related_rule_ids`: List of rule IDs that contributed to this incident.
- `evidence`: Sample evidence from related findings.
- `recommendations`: Combined remediation steps.
- `confidence`: `low`, `medium`, or `high` level of certainty.

### Finding
- `rule_id`: Unique identifier for the detection rule.
- `title`: Human-readable title of the finding.
- `severity`: `low`, `medium`, or `high`.
- `description`: Detailed explanation of the risk.
- `recommendation`: Suggested remediation steps.
- `evidence`: List of strings providing proof for the finding. 
- `metadata`: Key-value pairs containing structured data (e.g., `ip`, `count`).
- `matched_count`: Total number of occurrences for this finding.
- `matched_fields`: List of fields that triggered the rule (e.g., `["ip"]`).
- `matched_values`: List of values that triggered the rule (e.g., `["1.2.3.4"]`).

### ErrorResponse
- `detail`: A descriptive error message explaining what went wrong.

### AnalysisSummary
- `total_requests`: Total number of successfully parsed log lines.
- `unique_ips`: Count of distinct IP addresses found.
- `total_4xx`: Count of requests returning 400-499 status codes.
- `total_5xx`: Count of requests returning 500-599 status codes.
- `top_ips`: List of objects with `ip` and `count`.
- `top_paths`: List of objects with `path` and `count`.

import pytest
from fastapi.testclient import TestClient
from app.main import app
import io

client = TestClient(app)

def test_healthz():
    """Test the health check endpoint."""
    response = client.get("/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_analyze_valid_log():
    """Test analyzing a valid log file."""
    log_content = '192.168.1.1 - - [07/Jun/2026:10:00:01 +0000] "GET /index.html HTTP/1.1" 200 1024 "-" "Mozilla/5.0"\n'
    files = {"file": ("test.log", io.BytesIO(log_content.encode("utf-8")), "text/plain")}
    response = client.post("/api/analyze", files=files)
    
    assert response.status_code == 200
    data = response.json()
    assert "summary" in data
    assert "findings" in data
    assert "parse_stats" in data
    assert "skipped_samples" in data["parse_stats"]
    assert "report_markdown" in data
    assert "executive_summary" in data
    assert "rule_coverage" in data
    assert isinstance(data["rule_coverage"], list)
    assert len(data["rule_coverage"]) == 4
    assert data["executive_summary"] is not None
    assert data["executive_summary"]["overall_risk_level"] == "informational"
    assert data["summary"]["total_requests"] > 0
    assert data["parse_stats"]["parsed_lines"] == 1
    # Verify severity counts in API response
    assert "finding_severity_counts" in data["summary"]
    assert "incident_severity_counts" in data["summary"]
    assert data["summary"]["finding_severity_counts"]["high"] == 0
    assert data["summary"]["incident_severity_counts"]["high"] == 0

def test_analyze_empty_file():
    """Test uploading an empty file."""
    files = {"file": ("empty.log", io.BytesIO(b""), "text/plain")}
    response = client.post("/api/analyze", files=files)
    assert response.status_code == 400
    # Check for the standardized ErrorResponse format
    data = response.json()
    assert "detail" in data
    assert "Empty file" in data["detail"]

def test_analyze_invalid_extension():
    """Test uploading a file with an invalid extension."""
    files = {"file": ("test.exe", io.BytesIO(b"some content"), "application/octet-stream")}
    response = client.post("/api/analyze", files=files)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "Invalid file type" in data["detail"]

def test_analyze_file_too_large():
    """Test uploading a file that exceeds the 5MB limit."""
    # Create a content slightly larger than 5MB
    large_content = b"a" * (5 * 1024 * 1024 + 1)
    files = {"file": ("large.log", io.BytesIO(large_content), "text/plain")}
    response = client.post("/api/analyze", files=files)
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert "File too large" in data["detail"]

def test_analyze_sanitized_endpoint():
    """Test the sanitized analysis endpoint."""
    log_content = '1.2.3.4 - - [07/Jun/2026:10:00:01 +0000] "GET /api?token=secret HTTP/1.1" 200 1024 "-" "Mozilla/5.0"\n'
    files = {"file": ("test.log", io.BytesIO(log_content.encode("utf-8")), "text/plain")}
    response = client.post("/api/analyze/sanitized", files=files)
    
    assert response.status_code == 200
    data = response.json()
    # Check if IP and token are sanitized in the summary
    assert data["summary"]["top_ips"][0]["ip"] == "1.2.x.x"
    assert "token=<redacted>" in data["summary"]["top_paths"][0]["path"]
    # Check if report_markdown is also sanitized
    assert "1.2.x.x" in data["report_markdown"]
    assert "token=<redacted>" in data["report_markdown"]
    
    # Ensure original sensitive data is NOT present anywhere in the JSON response string
    import json
    response_str = json.dumps(data)
    assert "1.2.3.4" not in response_str
    assert "token=secret" not in response_str

def test_get_rules():
    """Test the get rules endpoint."""
    response = client.get("/api/rules")
    assert response.status_code == 200
    data = response.json()
    assert "high_frequency_threshold" in data
    assert "path_scanning_404_threshold" in data
    assert "sensitive_paths" in data
    assert "suspicious_user_agents" in data
    assert "source" in data
    assert isinstance(data["sensitive_paths"], list)
    assert isinstance(data["suspicious_user_agents"], list)

def test_analyze_with_log_format():
    """Test analyzing a log file with explicit log_format."""
    log_content = '192.168.1.1 - - [07/Jun/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 1024 "-" "UA"\n'
    files = {"file": ("test.log", io.BytesIO(log_content.encode("utf-8")), "text/plain")}
    data = {"log_format": "apache"}
    response = client.post("/api/analyze", files=files, data=data)
    assert response.status_code == 200
    # No direct way to check internal log_format without changing response, 
    # but we verify it doesn't crash.

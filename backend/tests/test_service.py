import pytest
from app.service import analyze_log_text
from app.schemas import AnalysisResult, AnalysisSummary

def test_analyze_log_text_contains_incidents():
    log_content = """192.168.1.1 - - [07/Jun/2026:10:00:01 +0000] "GET /index.html HTTP/1.1" 200 1024 "-" "Mozilla/5.0"
10.0.0.5 - - [07/Jun/2026:10:01:00 +0000] "GET /.env HTTP/1.1" 404 200 "-" "sqlmap/1.5"
"""
    result = analyze_log_text(log_content)
    
    assert isinstance(result, AnalysisResult)
    assert hasattr(result, "incidents")
    assert isinstance(result.incidents, list)
    # 10.0.0.5 has both sensitive path probe and sqlmap UA -> Reconnaissance Incident
    assert len(result.incidents) > 0
    assert any(inc.title == "Advanced Reconnaissance Activity" for inc in result.incidents)
    assert "# AI Log Security Analysis Report" in result.report_markdown    
    assert "## 6. Security Incidents" in result.report_markdown
    assert hasattr(result, "timeline_events")
    assert len(result.timeline_events) > 0

def test_analyze_log_text_severity_counts():
    log_content = """192.168.1.1 - - [07/Jun/2026:10:00:01 +0000] "GET /index.html HTTP/1.1" 200 1024 "-" "Mozilla/5.0"
10.0.0.5 - - [07/Jun/2026:10:01:00 +0000] "GET /.env HTTP/1.1" 404 200 "-" "sqlmap/1.5"
"""
    result = analyze_log_text(log_content)
    
    # Verify severity counts in summary
    assert "finding_severity_counts" in AnalysisSummary.model_fields
    assert "incident_severity_counts" in AnalysisSummary.model_fields
    
    # Findings: sqlmap UA (low), sensitive path (high)
    assert result.summary.finding_severity_counts["high"] >= 1
    assert result.summary.finding_severity_counts["low"] >= 1
    assert result.summary.finding_severity_counts["medium"] == 0
    
    # Incidents: Advanced Reconnaissance Activity (high)
    assert result.summary.incident_severity_counts["high"] >= 1
    assert result.summary.incident_severity_counts["medium"] == 0
    assert result.summary.incident_severity_counts["low"] == 0

def test_analyze_log_with_custom_config():
    from app.detector import DetectorConfig
    
    # 3 requests from same IP
    log_content = """1.1.1.1 - - [07/Jun/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 100 "-" "Mozilla/5.0"
1.1.1.1 - - [07/Jun/2026:10:00:02 +0000] "GET / HTTP/1.1" 200 100 "-" "Mozilla/5.0"
1.1.1.1 - - [07/Jun/2026:10:00:03 +0000] "GET / HTTP/1.1" 200 100 "-" "Mozilla/5.0"
"""
    # Default threshold is 10, should have no high frequency finding
    result_default = analyze_log_text(log_content)
    assert not any(f.rule_id == "high_frequency_ip" for f in result_default.findings)
    
    # Custom threshold 2, should have high frequency finding
    custom_config = DetectorConfig(freq_threshold=2)
    result_custom = analyze_log_text(log_content, config=custom_config)
    assert any(f.rule_id == "high_frequency_ip" for f in result_custom.findings)

def test_analyze_apache_sample():
    import os
    sample_path = os.path.join(os.path.dirname(__file__), "../../samples/apache_access_sample.log")
    if os.path.exists(sample_path):
        from app.service import analyze_log_file
        result = analyze_log_file(sample_path, log_format="apache")
        assert result.summary.total_requests > 0
        # 1.2.3.4 has 5 404s -> Scanning
        assert any(f.rule_id == "path_scanning" for f in result.findings)
        # 9.10.11.12 has 11 requests -> High frequency
        assert any(f.rule_id == "high_frequency_ip" for f in result.findings)

def test_analyze_log_text_with_overrides():
    from app.service import analyze_log_text_with_overrides
    from app.schemas import RuleTuningOverride

    log_content = '192.168.1.1 - - [07/Jun/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 1024 "-" "UA"\n' * 5

    # 1. Without overrides
    response_no_overrides = analyze_log_text_with_overrides(log_content)
    assert len(response_no_overrides.result.findings) == 0
    assert len(response_no_overrides.warnings) == 0

    # 2. With overrides
    overrides = RuleTuningOverride(high_frequency_threshold=3)
    response_with_overrides = analyze_log_text_with_overrides(log_content, overrides=overrides)
    assert len(response_with_overrides.result.findings) == 1
    assert response_with_overrides.result.findings[0].rule_id == "high_frequency_ip"
    assert response_with_overrides.applied_overrides.high_frequency_threshold == 3

    # 3. With invalid overrides
    invalid_overrides = RuleTuningOverride(high_frequency_threshold=0)
    response_invalid = analyze_log_text_with_overrides(log_content, overrides=invalid_overrides)
    assert len(response_invalid.warnings) > 0
    # Should fallback to default threshold (10), so no finding for 5 requests
    assert len(response_invalid.result.findings) == 0

import pytest
from app.service import analyze_log_text
from app.schemas import AnalysisResult

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
    assert "## 4. Security Incidents" in result.report_markdown

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

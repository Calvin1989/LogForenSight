import pytest
from app.sanitizer import sanitize_ip, sanitize_text, sanitize_analysis_result
from app.schemas import AnalysisResult, AnalysisSummary, Finding, Incident, ParseStats, TimelineEvent

def test_sanitize_ip():
    assert sanitize_ip("192.168.1.100") == "192.168.x.x"
    assert sanitize_ip("10.0.0.5") == "10.0.x.x"
    assert sanitize_ip("8.8.8.8") == "8.8.x.x"

def test_sanitize_text_secrets():
    text = "Access denied for token=abc12345 and session=xyz789. Password was 'secret123'."
    sanitized = sanitize_text(text)
    assert "token=<redacted>" in sanitized
    assert "session=<redacted>" in sanitized
    assert "Password" in sanitized # Key remains
    assert "abc12345" not in sanitized
    assert "xyz789" not in sanitized

def test_sanitize_text_auth_header():
    text = "Header Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    sanitized = sanitize_text(text)
    assert "Authorization: Bearer <redacted>" in sanitized
    assert "eyJhbGci" not in sanitized

def test_sanitize_analysis_result_immutability():
    summary = AnalysisSummary(
        total_requests=1, unique_ips=1, total_4xx=0, total_5xx=0,
        top_ips=[{"ip": "1.2.3.4", "count": 1}],
        top_paths=[{"path": "/api?token=secret", "count": 1}]
    )
    finding = Finding(
        rule_id="test", title="Test Finding", severity="high",
        description="Found 1.2.3.4", recommendation="Fix 1.2.3.4",
        evidence=["1.2.3.4 - GET /api?token=secret"],
        metadata={"ip": "1.2.3.4"},
        matched_count=1,
        matched_fields=["ip"],
        matched_values=["1.2.3.4"]
    )
    incident = Incident(
        incident_id="inc-1", title="Test Incident", severity="high",
        source_ip="1.2.3.4", summary="Incident from 1.2.3.4",
        related_rule_ids=["test"], evidence=["1.2.3.4 - suspicious"],
        recommendations=["Block 1.2.3.4"], confidence="high"
    )
    stats = ParseStats(
        total_lines=1, parsed_lines=1, skipped_lines=0,
        parse_rate=1.0, requested_format="auto", detected_format="nginx"
    )
    event = TimelineEvent(
        event_id="ev-1", timestamp="01/Jun/2026:10:00:00",
        source_ip="1.2.3.4", event_type="test", severity="high",
        title="Test Event", description="IP 1.2.3.4 accessed /?token=secret",
        evidence="1.2.3.4 - GET /?token=secret"
    )
    result = AnalysisResult(
        summary=summary, findings=[finding], incidents=[incident],
        timeline_events=[event],
        parse_stats=stats, report_markdown="IP: 1.2.3.4 and token=secret"
    )

    sanitized = sanitize_analysis_result(result)

    # Original should be untouched
    assert result.summary.top_ips[0]["ip"] == "1.2.3.4"
    assert "token=secret" in result.summary.top_paths[0]["path"]
    assert result.findings[0].description == "Found 1.2.3.4"
    assert result.findings[0].evidence[0] == "1.2.3.4 - GET /api?token=secret"
    assert result.incidents[0].source_ip == "1.2.3.4"
    assert result.timeline_events[0].source_ip == "1.2.3.4"
    assert result.report_markdown == "IP: 1.2.3.4 and token=secret"

    # Sanitized should be redacted
    assert sanitized.summary.top_ips[0]["ip"] == "1.2.x.x"
    assert "token=<redacted>" in sanitized.summary.top_paths[0]["path"]
    assert sanitized.findings[0].description == "Found 1.2.x.x"
    assert "1.2.x.x" in sanitized.findings[0].evidence[0]
    assert "token=<redacted>" in sanitized.findings[0].evidence[0]
    assert sanitized.findings[0].metadata["ip"] == "1.2.x.x"
    assert sanitized.findings[0].matched_values == ["1.2.x.x"]
    assert sanitized.incidents[0].source_ip == "1.2.x.x"
    assert "1.2.x.x" in sanitized.incidents[0].summary
    assert "1.2.x.x" in sanitized.incidents[0].evidence[0]
    assert "1.2.x.x" in sanitized.incidents[0].recommendations[0]

    # Timeline event sanitization
    assert sanitized.timeline_events[0].source_ip == "1.2.x.x"
    assert "1.2.x.x" in sanitized.timeline_events[0].description
    assert "token=<redacted>" in sanitized.timeline_events[0].description
    assert "1.2.x.x" in sanitized.timeline_events[0].evidence
    assert "token=<redacted>" in sanitized.timeline_events[0].evidence

    assert "1.2.x.x" in sanitized.report_markdown
    assert "token=<redacted>" in sanitized.report_markdown
    assert "1.2.3.4" not in sanitized.report_markdown
    assert "token=secret" not in sanitized.report_markdown

def test_sanitize_rule_coverage():
    from app.schemas import RuleCoverageItem

    summary = AnalysisSummary(
        total_requests=1, unique_ips=1, total_4xx=0, total_5xx=0,
        top_ips=[], top_paths=[]
    )
    stats = ParseStats(
        total_lines=1, parsed_lines=1, skipped_lines=0,
        parse_rate=1.0, requested_format="auto", detected_format="nginx"
    )

    item = RuleCoverageItem(
        rule_id="test", title="Test Rule", description="IP 1.2.3.4",
        severity="high", enabled=True, triggered=True,
        finding_count=1, incident_count=0, matched_count=1,
        matched_fields=["ip"],
        sample_matched_values=["1.2.3.4"],
        sample_evidence=["1.2.3.4 - token=secret"],
        related_incident_ids=[],
        explanation="Detected IP 1.2.3.4"
    )

    result = AnalysisResult(
        summary=summary, findings=[], incidents=[],
        parse_stats=stats, report_markdown="",
        rule_coverage=[item]
    )

    sanitized = sanitize_analysis_result(result)

    s_item = sanitized.rule_coverage[0]
    assert s_item.description == "IP 1.2.x.x"
    assert s_item.explanation == "Detected IP 1.2.x.x"
    assert s_item.sample_matched_values == ["1.2.x.x"]
    assert s_item.sample_evidence == ["1.2.x.x - token=<redacted>"]

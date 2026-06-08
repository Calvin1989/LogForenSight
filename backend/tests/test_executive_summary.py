import pytest
from app.schemas import AnalysisResult, AnalysisSummary, ParseStats
from app.executive_summary import generate_executive_summary
from app.sanitizer import sanitize_analysis_result

def test_executive_summary_empty():
    summary = AnalysisSummary(
        total_requests=100,
        unique_ips=5,
        total_4xx=0,
        total_5xx=0,
        top_ips=[{"ip": "1.2.3.4", "count": 20}],
        top_paths=[{"path": "/", "count": 100}]
    )
    stats = ParseStats(
        total_lines=100,
        parsed_lines=100,
        skipped_lines=0,
        parse_rate=1.0,
        requested_format="nginx",
        detected_format="nginx"
    )
    result = AnalysisResult(
        summary=summary,
        findings=[],
        incidents=[],
        timeline_events=[],
        parse_stats=stats,
        report_markdown=""
    )

    exe = generate_executive_summary(result)
    assert exe.overall_risk_level == "informational"
    assert exe.risk_score == 0
    assert "No significant security findings detected" in exe.headline
    assert len(exe.key_metrics) > 0
    assert len(exe.recommended_next_steps) > 0

def test_executive_summary_high_risk():
    from app.schemas import Finding, Incident

    summary = AnalysisSummary(
        total_requests=100,
        unique_ips=5,
        total_4xx=50,
        total_5xx=0,
        top_ips=[{"ip": "1.2.3.4", "count": 20}],
        top_paths=[{"path": "/.env", "count": 50}],
        finding_severity_counts={"high": 2}
    )
    findings = [
        Finding(rule_id="test", title="Sensitive Path Access", severity="high", description="Access to .env", recommendation="Block IP", evidence=[], metadata={})
    ]
    incidents = [
        Incident(incident_id="inc1", title="Critical Attack", severity="high", source_ip="1.2.3.4", summary="Attack detected", related_rule_ids=["test"], evidence=[], recommendations=[], confidence="high")
    ]

    stats = ParseStats(total_lines=100, parsed_lines=100, skipped_lines=0, parse_rate=1.0, requested_format="nginx", detected_format="nginx")

    result = AnalysisResult(
        summary=summary,
        findings=findings,
        incidents=incidents,
        timeline_events=[],
        parse_stats=stats,
        report_markdown=""
    )

    exe = generate_executive_summary(result)
    assert exe.overall_risk_level in ["high", "critical"]
    assert exe.risk_score > 25
    assert "Attack" in exe.headline or "High-risk" in exe.headline

def test_executive_summary_sanitization():
    from app.schemas import Incident

    summary = AnalysisSummary(
        total_requests=100,
        unique_ips=5,
        total_4xx=0,
        total_5xx=0,
        top_ips=[{"ip": "192.168.1.100", "count": 20}],
        top_paths=[{"path": "/", "count": 100}]
    )
    incidents = [
        Incident(incident_id="inc1", title="Attack from 192.168.1.100", severity="high", source_ip="192.168.1.100", summary="Token abc-123 exposed", related_rule_ids=[], evidence=[], recommendations=[], confidence="high")
    ]
    stats = ParseStats(total_lines=100, parsed_lines=100, skipped_lines=0, parse_rate=1.0, requested_format="nginx", detected_format="nginx")

    result = AnalysisResult(
        summary=summary,
        findings=[],
        incidents=incidents,
        timeline_events=[],
        parse_stats=stats,
        report_markdown=""
    )
    result.executive_summary = generate_executive_summary(result)

    sanitized = sanitize_analysis_result(result)

    exe = sanitized.executive_summary
    assert "192.168.x.x" in exe.top_risks[0]
    assert "192.168.1.100" not in exe.top_risks[0]
    assert "192.168.x.x" in exe.key_affected_ips
    # overview doesn't contain sensitive data in this case, so no <redacted> expected

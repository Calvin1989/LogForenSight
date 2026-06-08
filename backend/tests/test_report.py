import pytest
from app.schemas import AnalysisResult, AnalysisSummary, Finding, ParseStats, SkippedLineSample, RuleCoverageItem
from app.report import generate_markdown_report

def test_generate_markdown_report():
    summary = AnalysisSummary(
        total_requests=10,
        unique_ips=2,
        total_4xx=2,
        total_5xx=0,
        top_ips=[{"ip": "1.1.1.1", "count": 8}],
        top_paths=[{"path": "/index", "count": 8}],
        finding_severity_counts={"high": 1, "medium": 0, "low": 0},
        incident_severity_counts={"high": 0, "medium": 0, "low": 0}
    )
    findings = [
        Finding(
            rule_id="test_rule",
            title="Test Finding",
            severity="high",
            description="A test finding",
            recommendation="Fix it",
            evidence=["log line 1"],
            metadata={},
            matched_count=1,
            matched_fields=["ip"],
            matched_values=["1.1.1.1"]
        )
    ]
    stats = ParseStats(
        total_lines=11,
        parsed_lines=10,
        skipped_lines=1,
        parse_rate=0.9091,
        requested_format="auto",
        detected_format="nginx",
        skipped_samples=[
            SkippedLineSample(line_number=5, content="malformed line", reason="unmatched_log_format")
        ]
    )

    rule_coverage = [
        RuleCoverageItem(
            rule_id="test_rule",
            title="Test Rule Coverage",
            description="Coverage description",
            severity="high",
            enabled=True,
            triggered=True,
            finding_count=1,
            incident_count=0,
            matched_count=1,
            matched_fields=["ip"],
            sample_matched_values=["1.1.1.1"],
            sample_evidence=["log line 1"],
            related_incident_ids=[],
            explanation="Explanation"
        )
    ]

    result = AnalysisResult(
        summary=summary,
        findings=findings,
        incidents=[], # Added incidents field
        timeline_events=[],
        parse_stats=stats,
        report_markdown="",
        rule_coverage=rule_coverage
    )
    
    report = generate_markdown_report(result)
    assert "# AI Log Security Analysis Report" in report
    assert "## 2. Severity Distribution" in report
    assert "## 4. Attack Timeline" in report
    assert "### Finding Severity Distribution" in report
    assert "- **High:** 1" in report
    assert "## 3. Parsing Quality" in report
    assert "**Successfully Parsed:** 10" in report
    assert "### Skipped Line Samples" in report
    assert "Line 5" in report
    assert "malformed line" in report
    assert "Test Finding" in report
    assert "**Matched Details:**" in report
    assert "**Matched Count:** 1" in report
    assert "**Matched Fields:** ip" in report
    assert "**Matched Values:** 1.1.1.1" in report
    assert "log line 1" in report
    assert "## 8. Rule Coverage" in report
    assert "Test Rule Coverage" in report
    assert "🎯 Yes" in report
    assert "## 9. Remediation Suggestions" in report

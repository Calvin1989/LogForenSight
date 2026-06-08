import pytest
from app.schemas import AnalysisResult, AnalysisSummary, Finding, ParseStats, SkippedLineSample
from app.report import generate_markdown_report

def test_generate_markdown_report():
    summary = AnalysisSummary(
        total_requests=10,
        unique_ips=2,
        total_4xx=2,
        total_5xx=0,
        top_ips=[{"ip": "1.1.1.1", "count": 8}],
        top_paths=[{"path": "/index", "count": 8}]
    )
    findings = [
        Finding(
            rule_id="test_rule",
            title="Test Finding",
            severity="high",
            description="A test finding",
            recommendation="Fix it",
            evidence=["log line 1"],
            metadata={}
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
    result = AnalysisResult(
        summary=summary,
        findings=findings,
        incidents=[], # Added incidents field
        parse_stats=stats,
        report_markdown=""
    )
    
    report = generate_markdown_report(result)
    assert "# AI Log Security Analysis Report" in report
    assert "## 2. Parsing Quality" in report
    assert "**Successfully Parsed:** 10" in report
    assert "### Skipped Line Samples" in report
    assert "Line 5" in report
    assert "malformed line" in report
    assert "Test Finding" in report
    assert "log line 1" in report

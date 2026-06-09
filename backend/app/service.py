from collections import Counter
from typing import Any, List, Optional
from .schemas import (
    LogEntry, Finding, AnalysisSummary, AnalysisResult, Incident, ParseStats,
    RuleTuningOverride, RuleTuningPreviewResponse, SourceFileStats
)
from .parser import parse_lines, parse_file, parse_lines_with_stats
from .detector import detect, DetectorConfig
from .incident import build_incidents
from .timeline import build_timeline_events
from .report import generate_markdown_report
from .sanitizer import sanitize_analysis_result
from .executive_summary import generate_executive_summary
from .rule_coverage import build_rule_coverage
from .rule_tuning import apply_rule_overrides, validate_rule_overrides

def _calculate_summary(logs: List[LogEntry], findings: List[Finding] = None, incidents: List[Incident] = None) -> AnalysisSummary:
    """Calculates summary statistics from logs."""
    total_requests = len(logs)
    unique_ips = len(set(log.ip for log in logs))
    total_4xx = sum(1 for log in logs if 400 <= log.status < 500)
    total_5xx = sum(1 for log in logs if 500 <= log.status < 600)
    
    ip_counter = Counter(log.ip for log in logs)
    path_counter = Counter(log.path for log in logs)
    
    top_ips = [{"ip": ip, "count": count} for ip, count in ip_counter.most_common(5)]
    top_paths = [{"path": path, "count": count} for path, count in path_counter.most_common(5)]
    
    # Calculate severity counts
    finding_severity_counts = {"high": 0, "medium": 0, "low": 0}
    if findings:
        for f in findings:
            sev = f.severity.lower()
            if sev in finding_severity_counts:
                finding_severity_counts[sev] += 1
            else:
                finding_severity_counts[sev] = 1

    incident_severity_counts = {"high": 0, "medium": 0, "low": 0}
    if incidents:
        for i in incidents:
            sev = i.severity.lower()
            if sev in incident_severity_counts:
                incident_severity_counts[sev] += 1
            else:
                incident_severity_counts[sev] = 1

    return AnalysisSummary(
        total_requests=total_requests,
        unique_ips=unique_ips,
        total_4xx=total_4xx,
        total_5xx=total_5xx,
        top_ips=top_ips,
        top_paths=top_paths,
        finding_severity_counts=finding_severity_counts,
        incident_severity_counts=incident_severity_counts
    )

def _build_analysis_result(
    logs: List[LogEntry],
    stats: ParseStats,
    config: Optional[DetectorConfig] = None,
    analysis_mode: str = "single",
    source_files: Optional[List[SourceFileStats]] = None
) -> AnalysisResult:
    findings = detect(logs, config)
    incidents = build_incidents(findings)
    summary = _calculate_summary(logs, findings, incidents)
    timeline_events = build_timeline_events(logs, findings, incidents)
    rule_coverage = build_rule_coverage(config or DetectorConfig(), findings, incidents)

    result = AnalysisResult(
        summary=summary,
        findings=findings,
        incidents=incidents,
        timeline_events=timeline_events,
        parse_stats=stats,
        report_markdown="",  # Placeholder
        executive_summary=None,  # Placeholder
        rule_coverage=rule_coverage,
        analysis_mode=analysis_mode,
        source_files=source_files or []
    )

    result.executive_summary = generate_executive_summary(result)
    result.report_markdown = generate_markdown_report(result)
    return result

def analyze_log_text(log_text: str, config: Optional[DetectorConfig] = None, log_format: str = "auto") -> AnalysisResult:
    """
    Analyzes log content from a string.

    Args:
        log_text: String containing log lines.
        config: Detection configuration.
        log_format: Format of the log lines ("auto", "nginx", "apache").

    Returns:
        An AnalysisResult instance.
    """
    lines = log_text.strip().split('\n')
    logs, stats = parse_lines_with_stats(lines, log_format=log_format)
    return _build_analysis_result(logs, stats, config=config)

def analyze_log_files(
    files: List[dict[str, Any]],
    config: Optional[DetectorConfig] = None,
    log_format: str = "auto"
) -> AnalysisResult:
    """
    Analyzes multiple uploaded log files as one logical case while
    preserving per-source parsing statistics.
    """
    all_logs: List[LogEntry] = []
    source_files: List[SourceFileStats] = []

    for file_data in files:
        filename = str(file_data.get("filename", ""))
        content = str(file_data.get("content", ""))
        lines = content.splitlines()
        logs, stats = parse_lines_with_stats(lines, log_format=log_format, source_file=filename)

        all_logs.extend(logs)
        source_files.append(SourceFileStats(
            filename=filename,
            total_lines=stats.total_lines,
            parsed_lines=stats.parsed_lines,
            skipped_lines=stats.skipped_lines,
            parse_rate=stats.parse_rate,
            detected_format=stats.detected_format,
            skipped_samples=stats.skipped_samples
        ))

    total_lines = sum(item.total_lines for item in source_files)
    parsed_lines = sum(item.parsed_lines for item in source_files)
    skipped_lines = sum(item.skipped_lines for item in source_files)
    parse_rate = round((parsed_lines / total_lines), 4) if total_lines > 0 else 0.0
    detected_formats = [item.detected_format for item in source_files if item.detected_format != "unknown"]
    detected_format = detected_formats[0] if detected_formats else "unknown"
    skipped_samples = [sample for item in source_files for sample in item.skipped_samples][:5]

    aggregate_stats = ParseStats(
        total_lines=total_lines,
        parsed_lines=parsed_lines,
        skipped_lines=skipped_lines,
        parse_rate=parse_rate,
        requested_format=log_format,
        detected_format=detected_format,
        skipped_samples=skipped_samples
    )

    return _build_analysis_result(
        all_logs,
        aggregate_stats,
        config=config,
        analysis_mode="batch",
        source_files=source_files
    )

def analyze_log_text_sanitized(log_text: str, config: Optional[DetectorConfig] = None, log_format: str = "auto") -> AnalysisResult:
    """
    Analyzes log content from a string and returns a sanitized result.
    """
    result = analyze_log_text(log_text, config, log_format=log_format)
    return sanitize_analysis_result(result)

def analyze_log_text_with_overrides(
    log_text: str,
    log_format: str = "auto",
    overrides: Optional[RuleTuningOverride] = None,
    config: Optional[DetectorConfig] = None
) -> RuleTuningPreviewResponse:
    """
    Analyzes log text with temporary rule overrides.
    """
    if config is None:
        from .config_loader import load_detector_config
        config = load_detector_config()

    warnings = []
    applied_overrides = overrides or RuleTuningOverride()

    if overrides:
        warnings = validate_rule_overrides(overrides)
        config = apply_rule_overrides(config, overrides)
        applied_overrides = overrides

    result = analyze_log_text(log_text, config=config, log_format=log_format)

    return RuleTuningPreviewResponse(
        applied_overrides=applied_overrides,
        result=result,
        warnings=warnings
    )

def analyze_log_file(file_path: str, config: Optional[DetectorConfig] = None, log_format: str = "auto") -> AnalysisResult:
    """
    Analyzes log content from a file.

    Args:
        file_path: Path to the log file.
        config: Detection configuration.
        log_format: Format of the log lines ("auto", "nginx", "apache").

    Returns:
        An AnalysisResult instance.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        return analyze_log_text(f.read(), config, log_format=log_format)

def analyze_log_file_sanitized(file_path: str, config: Optional[DetectorConfig] = None, log_format: str = "auto") -> AnalysisResult:
    """
    Analyzes log content from a file and returns a sanitized result.
    """
    result = analyze_log_file(file_path, config, log_format=log_format)
    return sanitize_analysis_result(result)

from collections import Counter
from typing import List, Optional
from .schemas import LogEntry, Finding, AnalysisSummary, AnalysisResult, Incident, ParseStats
from .parser import parse_lines, parse_file, parse_lines_with_stats
from .detector import detect, DetectorConfig
from .incident import build_incidents
from .report import generate_markdown_report
from .sanitizer import sanitize_analysis_result

def _calculate_summary(logs: List[LogEntry]) -> AnalysisSummary:
    """Calculates summary statistics from logs."""
    total_requests = len(logs)
    unique_ips = len(set(log.ip for log in logs))
    total_4xx = sum(1 for log in logs if 400 <= log.status < 500)
    total_5xx = sum(1 for log in logs if 500 <= log.status < 600)
    
    ip_counter = Counter(log.ip for log in logs)
    path_counter = Counter(log.path for log in logs)
    
    top_ips = [{"ip": ip, "count": count} for ip, count in ip_counter.most_common(5)]
    top_paths = [{"path": path, "count": count} for path, count in path_counter.most_common(5)]
    
    return AnalysisSummary(
        total_requests=total_requests,
        unique_ips=unique_ips,
        total_4xx=total_4xx,
        total_5xx=total_5xx,
        top_ips=top_ips,
        top_paths=top_paths
    )

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
    
    summary = _calculate_summary(logs)
    findings = detect(logs, config)
    incidents = build_incidents(findings)
    
    result = AnalysisResult(
        summary=summary,
        findings=findings,
        incidents=incidents,
        parse_stats=stats,
        report_markdown="" # Placeholder
    )
    
    # Generate markdown and update result
    result.report_markdown = generate_markdown_report(result)
    return result

def analyze_log_text_sanitized(log_text: str, config: Optional[DetectorConfig] = None, log_format: str = "auto") -> AnalysisResult:
    """
    Analyzes log content from a string and returns a sanitized result.
    """
    result = analyze_log_text(log_text, config, log_format=log_format)
    return sanitize_analysis_result(result)

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

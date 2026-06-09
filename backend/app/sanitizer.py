import re
from .schemas import AnalysisResult, Finding, Incident, TimelineEvent

# Regex for IPv4
IP_PATTERN = re.compile(r'(\d{1,3}\.\d+)\.\d+\.\d+')

# Regex for query parameters and Authorization headers
SENSITIVE_PARAMS = ['token', 'session', 'key', 'password', 'secret']
SENSITIVE_PARAM_PATTERN = re.compile(
    rf'({"|".join(SENSITIVE_PARAMS)})=[^&\s]+', re.IGNORECASE
)
AUTH_HEADER_PATTERN = re.compile(r'(Authorization:\s+\w+\s+)\S+', re.IGNORECASE)

def sanitize_ip(ip: str) -> str:
    """Redacts the last two octets of an IPv4 address."""
    if not ip:
        return ip
    return IP_PATTERN.sub(r'\1.x.x', ip)

def sanitize_text(text: str) -> str:
    """
    Redacts sensitive information (IPs, tokens, passwords, auth headers) from text.
    """
    if not text:
        return text
    
    # 1. Sanitize IPs
    text = sanitize_ip(text)
    
    # 2. Sanitize query params (e.g., token=abc -> token=<redacted>)
    text = SENSITIVE_PARAM_PATTERN.sub(r'\1=<redacted>', text)
    
    # 3. Sanitize Authorization headers
    text = AUTH_HEADER_PATTERN.sub(r'\1<redacted>', text)
    
    return text

def _sanitize_finding_in_place(finding: Finding) -> None:
    """Modifies a Finding object in-place with sanitized data."""
    finding.description = sanitize_text(finding.description)
    finding.recommendation = sanitize_text(finding.recommendation)
    finding.evidence = [sanitize_text(e) for e in finding.evidence]
    finding.matched_values = [sanitize_text(v) for v in finding.matched_values]
    
    # Sanitize metadata values if they are strings
    new_metadata = {}
    for k, v in finding.metadata.items():
        if isinstance(v, str):
            new_metadata[k] = sanitize_text(v)
        elif isinstance(v, list):
            new_metadata[k] = [sanitize_text(i) if isinstance(i, str) else i for i in v]
        else:
            new_metadata[k] = v
    finding.metadata = new_metadata

def _sanitize_incident_in_place(incident: Incident) -> None:
    """Modifies an Incident object in-place with sanitized data."""
    incident.source_ip = sanitize_ip(incident.source_ip)
    incident.summary = sanitize_text(incident.summary)
    incident.evidence = [sanitize_text(e) for e in incident.evidence]
    incident.recommendations = [sanitize_text(r) for r in incident.recommendations]

def _sanitize_timeline_event_in_place(event: TimelineEvent) -> None:
    """Modifies a TimelineEvent object in-place with sanitized data."""
    event.source_ip = sanitize_ip(event.source_ip)
    event.description = sanitize_text(event.description)
    if event.evidence:
        event.evidence = sanitize_text(event.evidence)

def _sanitize_executive_summary_in_place(result: AnalysisResult) -> None:
    """Modifies the ExecutiveSummary in AnalysisResult in-place with sanitized data."""
    if not result.executive_summary:
        return

    exe = result.executive_summary
    exe.headline = sanitize_text(exe.headline)
    exe.overview = sanitize_text(exe.overview)
    exe.key_affected_ips = [sanitize_ip(ip) for ip in exe.key_affected_ips]
    exe.top_risks = [sanitize_text(risk) for risk in exe.top_risks]
    exe.recommended_next_steps = [sanitize_text(step) for step in exe.recommended_next_steps]
    exe.key_metrics = [sanitize_text(metric) for metric in exe.key_metrics]

def _sanitize_rule_coverage_in_place(result: AnalysisResult) -> None:
    """Modifies the RuleCoverage in AnalysisResult in-place with sanitized data."""
    if not result.rule_coverage:
        return

    for item in result.rule_coverage:
        item.title = sanitize_text(item.title)
        item.description = sanitize_text(item.description)
        item.explanation = sanitize_text(item.explanation)
        item.sample_matched_values = [sanitize_text(v) for v in item.sample_matched_values]
        item.sample_evidence = [sanitize_text(e) for e in item.sample_evidence]

def _sanitize_source_files_in_place(result: AnalysisResult) -> None:
    """Modifies batch source file stats in-place with sanitized data."""
    if not result.source_files:
        return

    for source_file in result.source_files:
        source_file.filename = sanitize_text(source_file.filename)
        for sample in source_file.skipped_samples:
            sample.content = sanitize_text(sample.content)

def sanitize_analysis_result(result: AnalysisResult) -> AnalysisResult:
    """
    Creates a new AnalysisResult with all sensitive data redacted.
    Guarantees that the original object is not modified.
    """
    # 1. Create a deep copy
    sanitized = result.model_copy(deep=True)
    
    # 2. Sanitize summary
    for item in sanitized.summary.top_ips:
        item["ip"] = sanitize_ip(item["ip"])
    
    for item in sanitized.summary.top_paths:
        item["path"] = sanitize_text(item["path"])
    
    # 3. Sanitize findings
    for finding in sanitized.findings:
        _sanitize_finding_in_place(finding)
        
    # 4. Sanitize incidents
    for incident in sanitized.incidents:
        _sanitize_incident_in_place(incident)

    # 5. Sanitize timeline events
    for event in sanitized.timeline_events:
        _sanitize_timeline_event_in_place(event)
    
    # 6. Sanitize executive summary
    _sanitize_executive_summary_in_place(sanitized)

    # 7. Sanitize rule coverage
    _sanitize_rule_coverage_in_place(sanitized)

    # 8. Sanitize batch source file details
    _sanitize_source_files_in_place(sanitized)

    # 9. Regenerate the markdown report based on sanitized data
    from .report import generate_markdown_report
    sanitized.report_markdown = generate_markdown_report(sanitized)
    
    # Final pass: sanitize the report_markdown text itself just in case 
    # (though generate_markdown_report should have used sanitized fields)
    sanitized.report_markdown = sanitize_text(sanitized.report_markdown)
    
    return sanitized

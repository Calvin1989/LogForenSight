import re
from typing import List, Any
from .schemas import Finding, Incident, AnalysisResult, AnalysisSummary

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
    
    # 5. Regenerate the markdown report based on sanitized data
    from .report import generate_markdown_report
    sanitized.report_markdown = generate_markdown_report(sanitized)
    
    # Final pass: sanitize the report_markdown text itself just in case 
    # (though generate_markdown_report should have used sanitized fields)
    sanitized.report_markdown = sanitize_text(sanitized.report_markdown)
    
    return sanitized

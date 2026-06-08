from pydantic import BaseModel
from typing import List, Dict, Any

class LogEntry(BaseModel):
    ip: str
    timestamp: str
    method: str
    path: str
    protocol: str
    status: int
    bytes_sent: int
    referer: str
    user_agent: str
    raw: str
    log_format: str = "unknown"

class Finding(BaseModel):
    rule_id: str
    title: str
    severity: str  # low / medium / high
    description: str
    recommendation: str
    evidence: List[str]
    metadata: Dict[str, Any]
    matched_count: int = 0
    matched_fields: List[str] = []
    matched_values: List[str] = []

class AnalysisSummary(BaseModel):
    total_requests: int
    unique_ips: int
    total_4xx: int
    total_5xx: int
    top_ips: List[Dict[str, Any]]
    top_paths: List[Dict[str, Any]]

class Incident(BaseModel):
    incident_id: str
    title: str
    severity: str
    source_ip: str
    summary: str
    related_rule_ids: List[str]
    evidence: List[str]
    recommendations: List[str]
    confidence: str

class ParseStats(BaseModel):
    total_lines: int
    parsed_lines: int
    skipped_lines: int
    parse_rate: float
    requested_format: str
    detected_format: str
    skipped_samples: List['SkippedLineSample'] = []

class SkippedLineSample(BaseModel):
    line_number: int
    content: str
    reason: str

class AnalysisResult(BaseModel):
    summary: AnalysisSummary
    findings: List[Finding]
    incidents: List[Incident]
    parse_stats: ParseStats
    report_markdown: str

class ErrorResponse(BaseModel):
    detail: str

class RuleConfigResponse(BaseModel):
    high_frequency_threshold: int
    path_scanning_404_threshold: int
    sensitive_paths: List[str]
    suspicious_user_agents: List[str]
    source: str

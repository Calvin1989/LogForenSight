from typing import List
from .schemas import AnalysisResult, ExecutiveSummary, Finding, Incident, TimelineEvent, AnalysisSummary

def generate_executive_summary(result: AnalysisResult) -> ExecutiveSummary:
    """
    Generates a deterministic executive summary from AnalysisResult.
    """
    summary = result.summary
    findings = result.findings
    incidents = result.incidents
    timeline_events = result.timeline_events

    # 1. Calculate Risk Score (0-100)
    risk_score = _calculate_risk_score(summary, findings, incidents, timeline_events)

    # 2. Determine Risk Level
    overall_risk_level = _get_risk_level(risk_score)

    # 3. Generate Headline
    headline = _generate_headline(overall_risk_level, findings, incidents)

    # 4. Generate Overview
    overview = _generate_overview(overall_risk_level, summary, findings, incidents)

    # 5. Extract Key Metrics
    key_metrics = [
        f"Total Requests Analyzed: {summary.total_requests}",
        f"Unique Source IPs: {summary.unique_ips}",
        f"Security Incidents Detected: {len(incidents)}",
        f"Individual Security Risks: {len(findings)}",
        f"Timeline Events Recorded: {len(timeline_events)}"
    ]

    # 6. Key Affected IPs (Top 3)
    key_affected_ips = [item['ip'] for item in summary.top_ips[:3]]

    # 7. Top Risks (Top 3 based on severity)
    top_risks = _get_top_risks(findings, incidents)

    # 8. Recommended Next Steps
    recommended_next_steps = _get_next_steps(findings, incidents, summary)

    # 9. Methodology
    methodology = "Deterministic summary generated from local rule findings, incidents, severity distribution, and timeline events. No LLM or external API is used."

    return ExecutiveSummary(
        overall_risk_level=overall_risk_level,
        risk_score=risk_score,
        headline=headline,
        overview=overview,
        key_metrics=key_metrics,
        key_affected_ips=key_affected_ips,
        top_risks=top_risks,
        recommended_next_steps=recommended_next_steps,
        methodology=methodology
    )

def _calculate_risk_score(summary: AnalysisSummary, findings: List[Finding], incidents: List[Incident], timeline_events: List[TimelineEvent]) -> int:
    score = 0

    # Weighting factors
    INCIDENT_WEIGHT = 25
    HIGH_FINDING_WEIGHT = 15
    MEDIUM_FINDING_WEIGHT = 5
    LOW_FINDING_WEIGHT = 1
    TIMELINE_EVENT_WEIGHT = 2

    # Add points for incidents
    score += len(incidents) * INCIDENT_WEIGHT

    # Add points for findings
    high_count = summary.finding_severity_counts.get("high", 0)
    medium_count = summary.finding_severity_counts.get("medium", 0)
    low_count = summary.finding_severity_counts.get("low", 0)

    score += high_count * HIGH_FINDING_WEIGHT
    score += medium_count * MEDIUM_FINDING_WEIGHT
    score += low_count * LOW_FINDING_WEIGHT

    # Add points for timeline events (indicates sustained activity)
    score += len(timeline_events) * TIMELINE_EVENT_WEIGHT

    # Cap score at 100
    return min(100, score)

def _get_risk_level(score: int) -> str:
    if score == 0:
        return "informational"
    if score < 25:
        return "low"
    if score < 50:
        return "medium"
    if score < 75:
        return "high"
    return "critical"

def _generate_headline(level: str, findings: List[Finding], incidents: List[Incident]) -> str:
    if not findings and not incidents:
        return "No significant security findings detected"

    if level == "critical":
        return "Critical web attack activity detected"
    if level == "high":
        return "High-risk suspicious access patterns detected"
    if level == "medium":
        return "Moderate security activity detected"
    return "Low-risk findings detected"

def _generate_overview(level: str, summary: AnalysisSummary, findings: List[Finding], incidents: List[Incident]) -> str:
    if not findings and not incidents:
        return "The analysis of the provided logs did not reveal any significant security threats. Traffic appears to be within normal operational parameters."

    finding_total = len(findings)
    incident_total = len(incidents)

    msg = f"Security analysis identified {incident_total} incidents and {finding_total} risk findings across {summary.total_requests} requests. "

    if level in ["critical", "high"]:
        msg += "Immediate attention is recommended to address high-severity threats and prevent potential compromise."
    elif level == "medium":
        msg += "Several suspicious activities were detected that warrant investigation to ensure system integrity."
    else:
        msg += "Minor issues were detected that should be reviewed as part of routine security maintenance."

    return msg

def _get_top_risks(findings: List[Finding], incidents: List[Incident]) -> List[str]:
    risks = []
    # Prefer incidents for top risks
    for inc in sorted(incidents, key=lambda x: x.severity == "high", reverse=True)[:3]:
        risks.append(f"{inc.title} (Incident)")

    # Fill remaining with findings if needed
    if len(risks) < 3:
        for f in sorted(findings, key=lambda x: x.severity == "high", reverse=True)[:3 - len(risks)]:
            risks.append(f"{f.title} (Finding)")

    return risks[:3]

def _get_next_steps(findings: List[Finding], incidents: List[Incident], summary: AnalysisSummary) -> List[str]:
    steps = []

    has_high = any(f.severity == "high" for f in findings) or any(i.severity == "high" for i in incidents)

    if has_high:
        steps.append("Review and investigate all critical/high severity incidents immediately.")
        steps.append("Block top offending source IPs at the firewall or WAF level.")

    if findings:
        steps.append("Inspect affected application paths for vulnerabilities or misconfigurations.")

    if summary.total_4xx > (summary.total_requests * 0.1): # More than 10% 4xx
        steps.append("Investigate high volume of 4xx errors which may indicate scanning or broken links.")

    steps.append("Rotate exposed tokens or credentials if sensitive parameters appeared in logs.")
    steps.append("Preserve analyzed logs for further incident response and auditing.")

    return steps[:5] # Return top 5 steps

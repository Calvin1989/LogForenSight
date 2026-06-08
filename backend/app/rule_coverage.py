from typing import List, Dict, Any, Set
from .schemas import Finding, Incident, RuleCoverageItem
from .detector import DetectorConfig

def build_rule_coverage(
    config: DetectorConfig,
    findings: List[Finding],
    incidents: List[Incident]
) -> List[RuleCoverageItem]:
    """
    Builds a summary of rule coverage, including triggered and untriggered rules.
    """
    # Define all available rules in the system
    # In a more dynamic system, this could be loaded from a registry
    rule_definitions = {
        "high_frequency_ip": {
            "title": "High Frequency Request",
            "description": "Detects source IPs that generate unusually high request volume within the analyzed log.",
            "severity": "medium",
            "explanation": "Detects source IPs that generate unusually high request volume within the analyzed log."
        },
        "path_scanning": {
            "title": "Path Scanning Detected",
            "description": "Detects repeated 404 responses that may indicate directory or path scanning.",
            "severity": "high",
            "explanation": "Detects repeated 404 responses that may indicate directory or path scanning."
        },
        "sensitive_path_probe": {
            "title": "Sensitive Path Probing",
            "description": "Detects attempts to access sensitive administrative or configuration paths.",
            "severity": "high",
            "explanation": "Detects attempts to access sensitive administrative or configuration paths."
        },
        "suspicious_user_agent": {
            "title": "Suspicious User Agent",
            "description": "Detects automated tools or suspicious clients based on User-Agent patterns.",
            "severity": "low",
            "explanation": "Detects automated tools or suspicious clients based on User-Agent patterns."
        }
    }

    # Rules are currently always enabled as they are hardcoded in detector.py
    # If we add toggles in config, we should reflect it here.
    enabled_rules = set(rule_definitions.keys()) - config.disabled_rules

    coverage: List[RuleCoverageItem] = []

    for rule_id, info in rule_definitions.items():
        # Aggregate findings for this rule
        rule_findings = [f for f in findings if f.rule_id == rule_id]
        finding_count = len(rule_findings)

        matched_count = sum(f.matched_count for f in rule_findings)

        # Unique matched fields
        matched_fields_set: Set[str] = set()
        for f in rule_findings:
            matched_fields_set.update(f.matched_fields)
        matched_fields = sorted(list(matched_fields_set))

        # Sample matched values (limit to 10)
        matched_values_set: Set[str] = set()
        for f in rule_findings:
            matched_values_set.update(f.matched_values)
        sample_matched_values = sorted(list(matched_values_set))[:10]

        # Sample evidence (limit to 5)
        evidence_list: List[str] = []
        for f in rule_findings:
            evidence_list.extend(f.evidence)
            if len(evidence_list) >= 5:
                break
        sample_evidence = evidence_list[:5]

        # Aggregate incidents for this rule
        rule_incidents = [i for i in incidents if rule_id in i.related_rule_ids]
        incident_count = len(rule_incidents)
        related_incident_ids = [i.incident_id for i in rule_incidents]

        triggered = finding_count > 0 or incident_count > 0

        coverage.append(RuleCoverageItem(
            rule_id=rule_id,
            title=info["title"],
            description=info["description"],
            severity=info["severity"],
            enabled=rule_id in enabled_rules,
            triggered=triggered,
            finding_count=finding_count,
            incident_count=incident_count,
            matched_count=matched_count,
            matched_fields=matched_fields,
            sample_matched_values=sample_matched_values,
            sample_evidence=sample_evidence,
            related_incident_ids=related_incident_ids,
            explanation=info["explanation"]
        ))

    return coverage

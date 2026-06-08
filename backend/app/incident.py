from typing import List, Dict, Set, Any
import uuid
import ipaddress
from .schemas import Finding, Incident

def is_private_ip(ip: str) -> bool:
    """
    Checks if an IP address is private (RFC 1918) or loopback.
    """
    try:
        ip_obj = ipaddress.ip_address(ip)
        return ip_obj.is_private or ip_obj.is_loopback
    except ValueError:
        return False

def get_ip_specific_recommendations(ip: str) -> List[str]:
    """
    Returns recommendations based on whether the IP is private or public.
    """
    if is_private_ip(ip):
        return [
            "Check internal asset inventory and service ownership for this IP.",
            "Verify if this activity corresponds to internal monitoring, vulnerability scanners, or automated tasks.",
            "Review internal access control lists (ACLs) and security group configurations."
        ]
    else:
        return [
            "Perform a WHOIS lookup to identify the organization owning this IP.",
            "Check this IP against threat intelligence databases (e.g., VirusTotal, AbuseIPDB).",
            "Consider blocking this IP at the edge firewall or WAF if the activity is unauthorized."
        ]

def build_incidents(findings: List[Finding]) -> List[Incident]:
    """
    Aggregates findings into high-level security incidents by Source IP.
    """
    # Group findings by Source IP
    findings_by_ip: Dict[str, List[Finding]] = {}
    for f in findings:
        ip = f.metadata.get("ip")
        if ip:
            if ip not in findings_by_ip:
                findings_by_ip[ip] = []
            findings_by_ip[ip].append(f)

    incidents: List[Incident] = []

    for ip, ip_findings in findings_by_ip.items():
        rule_ids = {f.rule_id for f in ip_findings}
        
        # Collect matched values and metadata
        all_metadata: Dict[str, Any] = {}
        paths = []
        uas = []
        for f in ip_findings:
            all_metadata.update(f.metadata)
            if f.rule_id == "sensitive_path_probe":
                paths.extend(f.matched_values)
            elif f.rule_id == "suspicious_user_agent":
                uas.extend(f.matched_values)
        
        paths = sorted(list(set(paths)))
        uas = sorted(list(set(uas)))
            
        incident_id = str(uuid.uuid4())[:8]
        evidence: List[str] = []
        for f in ip_findings:
            evidence.extend(f.evidence[:2])
        
        # 1. Reconnaissance (Sensitive Path Probe + Suspicious UA)
        if "sensitive_path_probe" in rule_ids and "suspicious_user_agent" in rule_ids:
            incidents.append(Incident(
                incident_id=incident_id,
                source_ip=ip,
                related_rule_ids=list(rule_ids),
                evidence=evidence[:5],
                title="Advanced Reconnaissance Activity",
                severity="high",
                summary=(
                    f"IP {ip} is performing coordinated reconnaissance. "
                    f"It used automated tools ({', '.join(uas)}) to probe sensitive "
                    f"system paths ({', '.join(paths)}). This combination suggests "
                    "a high-intent attempt to discover vulnerabilities."
                ),
                recommendations=[
                    "Immediately block this IP at the network/WAF level." if not is_private_ip(ip) else "Investigate the internal source of this activity.",
                    f"Verify if the probed paths ({', '.join(paths)}) exist and were successfully accessed.",
                    "Review server logs for any successful exploit attempts following these probes."
                ] + get_ip_specific_recommendations(ip)[:1],
                confidence="high"
            ))
            continue

        # 2. Directory Scanning
        if "path_scanning" in rule_ids:
            count = all_metadata.get("count", 0)
            incidents.append(Incident(
                incident_id=incident_id,
                source_ip=ip,
                related_rule_ids=list(rule_ids),
                evidence=evidence[:5],
                title="Intensive Directory Scanning",
                severity="high",
                summary=(
                    f"IP {ip} generated {count} 404 errors in a short period. "
                    "This behavior is characteristic of directory brute-forcing or "
                    "automated vulnerability scanning to discover hidden files."
                ),
                recommendations=[
                    "Block the IP if it's an external threat, or identify the misconfigured internal tool." if not is_private_ip(ip) else "Identify the internal script or tool causing these 404 errors.",
                    "Ensure 'Directory Listing' is disabled on the web server.",
                    "Check if the scanning targeted specific frameworks (e.g., WordPress, PHP)."
                ] + get_ip_specific_recommendations(ip)[:1],
                confidence="high"
            ))
            continue

        # 3. High Frequency Traffic
        if "high_frequency_ip" in rule_ids:
            count = all_metadata.get("count", 0)
            incidents.append(Incident(
                incident_id=incident_id,
                source_ip=ip,
                related_rule_ids=list(rule_ids),
                evidence=evidence[:5],
                title="Anomalous High Frequency Traffic",
                severity="medium",
                summary=(
                    f"IP {ip} made {count} requests, significantly exceeding normal thresholds. "
                    "This could indicate a Layer 7 DoS attempt, data scraping, or "
                    "a misconfigured automated client."
                ),
                recommendations=[
                    "Apply rate limiting to this IP.",
                    "Analyze the nature of the requests: are they targeting a single resource or distributed?",
                ] + get_ip_specific_recommendations(ip)[:2],
                confidence="medium"
            ))
            continue

        # 4. Automated Client
        if "suspicious_user_agent" in rule_ids:
            incidents.append(Incident(
                incident_id=incident_id,
                source_ip=ip,
                related_rule_ids=list(rule_ids),
                evidence=evidence[:5],
                title="Automated Tool Activity Detected",
                severity="low",
                summary=(
                    f"IP {ip} identified itself as an automated tool ({', '.join(uas)}). "
                    "While often used for scanning, this might also be a legitimate "
                    "internal script or a monitoring service."
                ),
                recommendations=[
                    "Identify if the tool/UA is authorized for your environment.",
                    "If unauthorized, monitor for further suspicious activity or block."
                ] + get_ip_specific_recommendations(ip)[:1],
                confidence="medium"
            ))
            continue
            
        # 5. Fallback for other single probes
        if "sensitive_path_probe" in rule_ids:
            incidents.append(Incident(
                incident_id=incident_id,
                source_ip=ip,
                related_rule_ids=list(rule_ids),
                evidence=evidence[:5],
                title="Sensitive Resource Probe",
                severity="medium",
                summary=f"IP {ip} attempted to access sensitive resources: {', '.join(paths)}.",
                recommendations=[
                    "Investigate why this IP is targeting these specific paths.",
                    "Ensure these resources are properly protected by authentication."
                ] + get_ip_specific_recommendations(ip)[:1],
                confidence="medium"
            ))

    return incidents

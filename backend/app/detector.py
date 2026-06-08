from collections import Counter
from typing import List, Set, Optional, Dict
from dataclasses import dataclass, field
from .schemas import LogEntry, Finding

@dataclass
class DetectorConfig:
    """Configuration for security detection rules."""
    freq_threshold: int = 10
    scan_threshold: int = 5
    sensitive_paths: Set[str] = field(default_factory=lambda: {
        '/.env', '/admin', '/wp-login.php', '/phpmyadmin', '/config.php', '/.git'
    })
    suspicious_ua_keywords: Set[str] = field(default_factory=lambda: {
        'sqlmap', 'curl', 'python-requests', 'nikto', 'nmap', 'zgrab'
    })

def detect(
    logs: List[LogEntry], 
    config: Optional[DetectorConfig] = None
) -> List[Finding]:
    """
    Analyzes logs and detects suspicious behaviors.

    Args:
        logs: List of LogEntry instances.
        config: An instance of DetectorConfig.

    Returns:
        A list of Finding instances.
    """
    if config is None:
        config = DetectorConfig()
    
    findings: List[Finding] = []

    ip_counts = Counter()
    ip_404_counts = Counter()
    
    # Store evidence and metadata
    sensitive_probes_by_ip: Dict[str, List[str]] = {}
    probed_paths_by_ip: Dict[str, Set[str]] = {}
    
    suspicious_ua_by_ip: Dict[str, List[str]] = {}
    uas_by_ip: Dict[str, Set[str]] = {}

    for log in logs:
        ip = log.ip
        path = log.path.split('?')[0]
        ua = log.user_agent
        ua_lower = ua.lower()
        status = log.status

        # 1. Frequency check
        ip_counts[ip] += 1

        # 2. 404 check
        if status == 404:
            ip_404_counts[ip] += 1

        # 3. Sensitive path check
        if path in config.sensitive_paths:
            if ip not in sensitive_probes_by_ip:
                sensitive_probes_by_ip[ip] = []
                probed_paths_by_ip[ip] = set()
            
            evidence_str = f"Path: {path} | Raw: {log.raw.strip()}"
            if evidence_str not in sensitive_probes_by_ip[ip]:
                sensitive_probes_by_ip[ip].append(evidence_str)
                probed_paths_by_ip[ip].add(path)

        # 4. Suspicious UA check
        if not ua_lower or any(keyword in ua_lower for keyword in config.suspicious_ua_keywords):
            if ip not in suspicious_ua_by_ip:
                suspicious_ua_by_ip[ip] = []
                uas_by_ip[ip] = set()
            
            ua_display = ua if ua else "Empty User-Agent"
            evidence_str = f"UA: {ua_display} | Raw: {log.raw.strip()}"
            if evidence_str not in suspicious_ua_by_ip[ip]:
                suspicious_ua_by_ip[ip].append(evidence_str)
                uas_by_ip[ip].add(ua_display)

    # High Frequency IPs
    for ip, count in ip_counts.items():
        if count >= config.freq_threshold:
            findings.append(Finding(
                rule_id="high_frequency_ip",
                title="High Frequency Request",
                severity="medium",
                description=f"IP {ip} made {count} requests, exceeding threshold of {config.freq_threshold}.",
                recommendation="Implement rate limiting or block the IP if behavior persists.",
                evidence=[f"Total requests from this IP: {count}"],
                metadata={"ip": ip, "count": count}
            ))

    # Path Scanning
    for ip, count in ip_404_counts.items():
        if count >= config.scan_threshold:
            findings.append(Finding(
                rule_id="path_scanning",
                title="Path Scanning Detected",
                severity="high",
                description=f"IP {ip} generated {count} 404 errors, indicating potential directory scanning.",
                recommendation="Block this IP and investigate the target paths.",
                evidence=[f"Total 404 errors from this IP: {count}"],
                metadata={"ip": ip, "count": count}
            ))

    # Sensitive Path Probes
    for ip, evidence_list in sensitive_probes_by_ip.items():
        findings.append(Finding(
            rule_id="sensitive_path_probe",
            title="Sensitive Path Probing",
            severity="high",
            description=f"IP {ip} attempted to access sensitive configuration or admin paths.",
            recommendation="Immediate block recommended. Verify if any probes were successful.",
            evidence=evidence_list[:5],
            metadata={
                "ip": ip, 
                "probe_count": len(evidence_list),
                "paths": list(probed_paths_by_ip[ip])
            }
        ))

    # Suspicious User Agents
    for ip, evidence_list in suspicious_ua_by_ip.items():
        findings.append(Finding(
            rule_id="suspicious_user_agent",
            title="Suspicious User Agent",
            severity="low",
            description=f"IP {ip} is using a suspicious or automated User-Agent.",
            recommendation="Monitor traffic from this IP. Consider blocking if it's not a legitimate crawler.",
            evidence=evidence_list[:5],
            metadata={
                "ip": ip, 
                "ua_count": len(evidence_list),
                "user_agents": list(uas_by_ip[ip])
            }
        ))

    return findings

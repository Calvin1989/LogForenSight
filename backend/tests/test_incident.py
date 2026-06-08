import pytest
from app.schemas import Finding
from app.incident import build_incidents, is_private_ip, get_ip_specific_recommendations

def test_is_private_ip():
    assert is_private_ip("192.168.1.1") is True
    assert is_private_ip("10.0.0.1") is True
    assert is_private_ip("172.16.0.1") is True
    assert is_private_ip("172.31.255.255") is True
    assert is_private_ip("127.0.0.1") is True
    assert is_private_ip("8.8.8.8") is False
    assert is_private_ip("1.1.1.1") is False
    assert is_private_ip("invalid") is False

def test_get_ip_specific_recommendations():
    private_recs = get_ip_specific_recommendations("192.168.1.1")
    assert any("internal asset inventory" in r for r in private_recs)
    
    public_recs = get_ip_specific_recommendations("8.8.8.8")
    assert any("WHOIS lookup" in r for r in public_recs)

def test_build_incident_private_ip():
    findings = [
        Finding(
            rule_id="suspicious_user_agent",
            title="Suspicious UA",
            severity="low",
            description="UA",
            recommendation="Monitor",
            evidence=["ev2"],
            metadata={"ip": "192.168.1.10", "user_agents": ["curl/7.68"]},
            matched_count=1,
            matched_fields=["user_agent"],
            matched_values=["curl/7.68"]
        )
    ]
    incidents = build_incidents(findings)
    assert len(incidents) == 1
    incident = incidents[0]
    # Should NOT have WHOIS recommendation, should have internal asset one
    assert not any("WHOIS" in r for r in incident.recommendations)
    assert any("internal asset inventory" in r or "internal source" in r for r in incident.recommendations)

def test_build_reconnaissance_incident_polished():
    findings = [
        Finding(
            rule_id="sensitive_path_probe",
            title="Sensitive Path Probe",
            severity="high",
            description="Probe",
            recommendation="Block",
            evidence=["ev1"],
            metadata={"ip": "1.1.1.1", "paths": ["/.env"]},
            matched_count=1,
            matched_fields=["path"],
            matched_values=["/.env"]
        ),
        Finding(
            rule_id="suspicious_user_agent",
            title="Suspicious UA",
            severity="low",
            description="UA",
            recommendation="Monitor",
            evidence=["ev2"],
            metadata={"ip": "1.1.1.1", "user_agents": ["sqlmap/1.5"]},
            matched_count=1,
            matched_fields=["user_agent"],
            matched_values=["sqlmap/1.5"]
        )
    ]
    incidents = build_incidents(findings)
    assert len(incidents) == 1
    incident = incidents[0]
    assert incident.title == "Advanced Reconnaissance Activity"
    assert incident.severity == "high"
    assert incident.confidence == "high"
    assert "coordinated reconnaissance" in incident.summary
    assert "sqlmap/1.5" in incident.summary
    assert "/.env" in incident.summary
    assert any("Immediately block" in r for r in incident.recommendations)

def test_build_automated_client_incident_with_fp_hint():
    findings = [
        Finding(
            rule_id="suspicious_user_agent",
            title="Suspicious UA",
            severity="low",
            description="UA",
            recommendation="Monitor",
            evidence=["ev2"],
            metadata={"ip": "2.2.2.2", "user_agents": ["python-requests/2.25"]},
            matched_count=1,
            matched_fields=["user_agent"],
            matched_values=["python-requests/2.25"]
        )
    ]
    incidents = build_incidents(findings)
    assert len(incidents) == 1
    incident = incidents[0]
    assert incident.title == "Automated Tool Activity Detected"
    assert incident.severity == "low"
    assert "legitimate internal script" in incident.summary
    assert "python-requests/2.25" in incident.summary

def test_build_directory_scanning_incident_polished():
    findings = [
        Finding(
            rule_id="path_scanning",
            title="Scanning",
            severity="high",
            description="Scan",
            recommendation="Block",
            evidence=["ev1"],
            metadata={"ip": "3.3.3.3", "count": 15}
        )
    ]
    incidents = build_incidents(findings)
    assert len(incidents) == 1
    incident = incidents[0]
    assert "15 404 errors" in incident.summary
    assert incident.confidence == "high"
    assert any("Directory Listing" in r for r in incident.recommendations)

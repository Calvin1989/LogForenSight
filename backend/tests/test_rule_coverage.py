import pytest
from app.rule_coverage import build_rule_coverage
from app.detector import DetectorConfig
from app.schemas import Finding, Incident

def test_build_rule_coverage_basic():
    config = DetectorConfig()
    findings = [
        Finding(
            rule_id="high_frequency_ip",
            title="High Frequency Request",
            severity="medium",
            description="IP 1.1.1.1 made 10 requests",
            recommendation="Block IP",
            evidence=["Total requests: 10"],
            metadata={"ip": "1.1.1.1", "count": 10},
            matched_count=10,
            matched_fields=["ip"],
            matched_values=["1.1.1.1"]
        )
    ]
    incidents = [
        Incident(
            incident_id="inc1",
            title="Anomalous High Frequency Traffic",
            severity="medium",
            source_ip="1.1.1.1",
            summary="High traffic from 1.1.1.1",
            related_rule_ids=["high_frequency_ip"],
            evidence=["Total requests: 10"],
            recommendations=["Rate limit"],
            confidence="high"
        )
    ]

    coverage = build_rule_coverage(config, findings, incidents)

    # Check that all 4 rules are present
    assert len(coverage) == 4

    # Check triggered rule
    hf_rule = next(r for r in coverage if r.rule_id == "high_frequency_ip")
    assert hf_rule.triggered is True
    assert hf_rule.finding_count == 1
    assert hf_rule.incident_count == 1
    assert hf_rule.matched_count == 10
    assert "ip" in hf_rule.matched_fields
    assert "1.1.1.1" in hf_rule.sample_matched_values
    assert hf_rule.related_incident_ids == ["inc1"]

    # Check untriggered rule
    ps_rule = next(r for r in coverage if r.rule_id == "path_scanning")
    assert ps_rule.triggered is False
    assert ps_rule.finding_count == 0
    assert ps_rule.incident_count == 0
    assert ps_rule.matched_count == 0
    assert ps_rule.matched_fields == []
    assert ps_rule.sample_matched_values == []
    assert ps_rule.related_incident_ids == []

def test_build_rule_coverage_multiple_findings():
    config = DetectorConfig()
    findings = [
        Finding(
            rule_id="sensitive_path_probe",
            title="Sensitive Path Probing",
            severity="high",
            description="IP 1.1.1.1 probed /.env",
            recommendation="Block IP",
            evidence=["Path: /.env"],
            metadata={"ip": "1.1.1.1"},
            matched_count=1,
            matched_fields=["path"],
            matched_values=["/.env"]
        ),
        Finding(
            rule_id="sensitive_path_probe",
            title="Sensitive Path Probing",
            severity="high",
            description="IP 2.2.2.2 probed /admin",
            recommendation="Block IP",
            evidence=["Path: /admin"],
            metadata={"ip": "2.2.2.2"},
            matched_count=1,
            matched_fields=["path"],
            matched_values=["/admin"]
        )
    ]

    coverage = build_rule_coverage(config, findings, [])

    sp_rule = next(r for r in coverage if r.rule_id == "sensitive_path_probe")
    assert sp_rule.triggered is True
    assert sp_rule.finding_count == 2
    assert sp_rule.matched_count == 2
    assert "path" in sp_rule.matched_fields
    assert sorted(sp_rule.sample_matched_values) == ["/.env", "/admin"]
    assert len(sp_rule.sample_evidence) == 2

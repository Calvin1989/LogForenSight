import pytest
from app.detector import detect, DetectorConfig
from app.schemas import LogEntry

def create_log(ip='1.1.1.1', path='/', ua='Mozilla', status=200):
    raw = f'{ip} - - [07/Jun/2026:10:00:00 +0000] "GET {path} HTTP/1.1" {status} 100 "-" "{ua}"'
    return LogEntry(
        ip=ip, timestamp='07/Jun/2026:10:00:00 +0000', method='GET', path=path,
        protocol='HTTP/1.1', status=status, bytes_sent=100,
        referer='-', user_agent=ua, raw=raw
    )

def test_detect_sensitive_path_evidence():
    logs = [create_log(ip='1.1.1.1', path='/.env', status=404)]
    findings = detect(logs)
    finding = next(f for f in findings if f.rule_id == 'sensitive_path_probe')
    assert any('/.env' in e for e in finding.evidence)
    assert any('Raw:' in e for e in finding.evidence)

def test_detect_suspicious_ua_evidence():
    logs = [create_log(ip='1.1.1.1', ua='sqlmap/1.5')]
    findings = detect(logs)
    finding = next(f for f in findings if f.rule_id == 'suspicious_user_agent')
    assert any('UA: sqlmap/1.5' in e for e in finding.evidence)
    assert any('Raw:' in e for e in finding.evidence)

def test_detect_high_frequency_evidence():
    logs = [create_log(ip='1.1.1.1')] * 10
    config = DetectorConfig(freq_threshold=5)
    findings = detect(logs, config=config)
    finding = next(f for f in findings if f.rule_id == 'high_frequency_ip')
    assert any('10' in e for e in finding.evidence)

def test_detect_path_scanning_evidence():
    logs = [create_log(ip='1.1.1.1', status=404)] * 6
    config = DetectorConfig(scan_threshold=5)
    findings = detect(logs, config=config)
    finding = next(f for f in findings if f.rule_id == 'path_scanning')
    assert any('6' in e for e in finding.evidence)

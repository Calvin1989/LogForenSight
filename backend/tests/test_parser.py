import pytest
from app.parser import parse_line, parse_lines, parse_lines_with_stats
from app.schemas import LogEntry, ParseStats

def test_parse_lines_with_stats():
    lines = [
        '192.168.1.1 - - [07/Jun/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 1024 "-" "UA"',
        '  ', # empty line
        'invalid line',
        '10.0.0.5 - - [08/Jun/2026:10:05:00 +0000] "GET /admin HTTP/1.1" 403 512 "-" "UA"'
    ]
    logs, stats = parse_lines_with_stats(lines, log_format="auto")
    assert len(logs) == 2
    assert isinstance(stats, ParseStats)
    assert stats.total_lines == 3 # non-empty: 2 valid + 1 invalid
    assert stats.parsed_lines == 2
    assert stats.skipped_lines == 1
    assert stats.parse_rate == round(2/3, 4)
    assert stats.requested_format == "auto"
    assert stats.detected_format == "combined"
    assert len(stats.skipped_samples) == 1
    assert stats.skipped_samples[0].line_number == 3
    assert stats.skipped_samples[0].content == "invalid line"
    assert stats.skipped_samples[0].reason == "unmatched_log_format"

def test_parse_line_nginx():
    line = '192.168.1.1 - - [07/Jun/2026:10:00:01 +0000] "GET /index.html HTTP/1.1" 200 1024 "-" "Mozilla/5.0"'
    parsed = parse_line(line, log_format="nginx")
    assert isinstance(parsed, LogEntry)
    assert parsed.ip == '192.168.1.1'
    assert parsed.status == 200
    assert parsed.bytes_sent == 1024
    assert parsed.log_format == "nginx"

def test_parse_line_apache():
    # Apache combined is virtually identical, but sometimes uses "-" for bytes
    line = '10.0.0.5 - - [08/Jun/2026:10:05:00 +0000] "GET /admin HTTP/1.1" 403 - "-" "Mozilla/5.0"'
    parsed = parse_line(line, log_format="apache")
    assert isinstance(parsed, LogEntry)
    assert parsed.ip == '10.0.0.5'
    assert parsed.status == 403
    assert parsed.bytes_sent == 0
    assert parsed.log_format == "apache"

def test_parse_line_auto():
    line = '1.2.3.4 - - [08/Jun/2026:10:10:00 +0000] "GET /.env HTTP/1.1" 404 256 "-" "curl/7.68.0"'
    parsed = parse_line(line, log_format="auto")
    assert isinstance(parsed, LogEntry)
    assert parsed.ip == '1.2.3.4'
    assert parsed.log_format == "combined" # Default auto tag

def test_parse_line_invalid():
    line = 'invalid log line'
    parsed = parse_line(line)
    assert parsed is None

def test_parse_lines_mixed():
    lines = [
        '192.168.1.1 - - [07/Jun/2026:10:00:01 +0000] "GET / HTTP/1.1" 200 1024 "-" "UA"',
        'invalid line',
        '10.0.0.5 - - [08/Jun/2026:10:05:00 +0000] "GET /admin HTTP/1.1" 403 512 "-" "UA"'
    ]
    results = parse_lines(lines)
    assert len(results) == 2
    assert results[0].ip == '192.168.1.1'
    assert results[1].ip == '10.0.0.5'

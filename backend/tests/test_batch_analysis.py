import io

from fastapi.testclient import TestClient

from app.main import app
from app.parser import parse_lines
from app.sanitizer import sanitize_analysis_result
from app.service import analyze_log_files, analyze_log_text


client = TestClient(app)

LOG_LINE_1 = '192.168.1.10 - - [07/Jun/2026:10:00:01 +0000] "GET /index.html HTTP/1.1" 200 1024 "-" "Mozilla/5.0"'
LOG_LINE_2 = '10.0.0.5 - - [07/Jun/2026:10:01:00 +0000] "GET /.env HTTP/1.1" 404 200 "-" "sqlmap/1.5"'


def test_analyze_log_files_batch_success():
    files = [
        {"filename": "web-1.log", "content": f"{LOG_LINE_1}\ninvalid line"},
        {"filename": "web-2.log", "content": LOG_LINE_2},
    ]

    result = analyze_log_files(files)

    assert result.analysis_mode == "batch"
    assert result.summary.total_requests == 2
    assert result.parse_stats.total_lines == 3
    assert result.parse_stats.parsed_lines == 2
    assert result.parse_stats.skipped_lines == 1
    assert result.parse_stats.parse_rate == round(2 / 3, 4)
    assert len(result.source_files) == 2

    first_file = result.source_files[0]
    assert first_file.filename == "web-1.log"
    assert first_file.parsed_lines == 1
    assert first_file.skipped_lines == 1
    assert first_file.parse_rate == 0.5

    second_file = result.source_files[1]
    assert second_file.filename == "web-2.log"
    assert second_file.parsed_lines == 1
    assert second_file.skipped_lines == 0
    assert second_file.parse_rate == 1.0


def test_single_file_analysis_mode_still_single():
    result = analyze_log_text(LOG_LINE_1)
    assert result.analysis_mode == "single"
    assert result.source_files == []


def test_batch_api_returns_200():
    response = client.post(
        "/api/analyze/batch",
        files=[
            ("files", ("web-1.log", io.BytesIO(f"{LOG_LINE_1}\ninvalid line".encode("utf-8")), "text/plain")),
            ("files", ("web-2.log", io.BytesIO(LOG_LINE_2.encode("utf-8")), "text/plain")),
        ],
        data={"log_format": "auto"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["analysis_mode"] == "batch"
    assert len(data["source_files"]) == 2
    assert data["source_files"][0]["filename"] == "web-1.log"


def test_batch_api_empty_file_returns_400():
    response = client.post(
        "/api/analyze/batch",
        files=[("files", ("empty.log", io.BytesIO(b""), "text/plain"))],
        data={"log_format": "auto"},
    )

    assert response.status_code == 400
    assert "Empty file" in response.json()["detail"]


def test_sanitizer_applies_to_source_files():
    files = [
        {
            "filename": "case-1.2.3.4-token=secret.log",
            "content": f"{LOG_LINE_1}\n1.2.3.4 token=secret invalid line",
        }
    ]

    result = analyze_log_files(files)
    sanitized = sanitize_analysis_result(result)

    assert sanitized.source_files[0].filename == "case-1.2.x.x-token=<redacted>"
    assert "1.2.3.4" not in sanitized.source_files[0].filename
    assert "token=secret" not in sanitized.source_files[0].filename
    assert sanitized.source_files[0].skipped_samples[0].content == "1.2.x.x token=<redacted> invalid line"


def test_report_markdown_includes_source_files_details():
    files = [
        {"filename": "web-1.log", "content": f"{LOG_LINE_1}\ninvalid line"},
        {"filename": "web-2.log", "content": LOG_LINE_2},
    ]

    result = analyze_log_files(files)

    assert "Source Files Parsing Details" in result.report_markdown
    assert "| File | Total Lines | Parsed | Skipped | Parse Rate | Format |" in result.report_markdown
    assert "web-1.log" in result.report_markdown
    assert "web-2.log" in result.report_markdown


def test_log_entry_source_file_tracks_origin():
    logs = parse_lines([LOG_LINE_1, LOG_LINE_2], source_file="web-1.log")

    assert len(logs) == 2
    assert all(log.source_file == "web-1.log" for log in logs)

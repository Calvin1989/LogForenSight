import re
from typing import Optional, List, Tuple
from .schemas import LogEntry, ParseStats, SkippedLineSample

# Nginx/Apache Combined Log Format Pattern
# Format: $remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent "$http_referer" "$http_user_agent"
# Note: Nginx and Apache Combined formats are very similar. 
# Apache often uses %h %l %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\"
COMBINED_PATTERN = re.compile(
    r'(?P<ip>\S+) \S+ \S+ \[(?P<timestamp>.*?)\] '
    r'"(?P<method>\S+) (?P<path>\S+) (?P<protocol>\S+)" '
    r'(?P<status>\d+) (?P<bytes_sent>\S+) "(?P<referer>.*?)" "(?P<user_agent>.*?)"'
)

def parse_line(line: str, log_format: str = "auto", source_file: str = "") -> Optional[LogEntry]:
    """
    Parses a single line of access log into a LogEntry model.
    Supports Nginx and Apache combined formats.
    """
    line = line.strip()
    if not line:
        return None

    match = COMBINED_PATTERN.match(line)
    if not match:
        return None
    
    data = match.groupdict()
    
    # Handle Apache's "-" for bytes_sent
    bytes_sent = data['bytes_sent']
    bytes_sent_int = int(bytes_sent) if bytes_sent.isdigit() else 0

    # Basic heuristic for auto-detection if needed, 
    # but since Combined format is identical for both, 
    # we mostly rely on the user or just label it based on pattern match.
    detected_format = log_format
    if log_format == "auto":
        # In a real scenario, we might look for specific artifacts, 
        # but here we'll just treat it as a generic combined log.
        detected_format = "combined"

    return LogEntry(
        ip=data['ip'],
        timestamp=data['timestamp'],
        method=data['method'],
        path=data['path'],
        protocol=data['protocol'],
        status=int(data['status']),
        bytes_sent=bytes_sent_int,
        referer=data['referer'],
        user_agent=data['user_agent'],
        raw=line,
        log_format=detected_format,
        source_file=source_file
    )

def parse_lines(lines: List[str], log_format: str = "auto", source_file: str = "") -> List[LogEntry]:
    """
    Parses multiple lines of access log.
    """
    logs, _ = parse_lines_with_stats(lines, log_format=log_format, source_file=source_file)
    return logs

def parse_lines_with_stats(
    lines: List[str],
    log_format: str = "auto",
    source_file: str = ""
) -> Tuple[List[LogEntry], ParseStats]:
    """
    Parses multiple lines of access log and returns statistics.
    """
    results: List[LogEntry] = []
    skipped_samples: List[SkippedLineSample] = []
    
    # We need original line numbers (1-indexed)
    non_empty_line_data = [(i+1, l) for i, l in enumerate(lines) if l.strip()]
    total_lines = len(non_empty_line_data)
    
    detected_format = "unknown"
    
    for line_num, line in non_empty_line_data:
        parsed = parse_line(line, log_format=log_format, source_file=source_file)
        if parsed:
            results.append(parsed)
            # If auto, we pick up the format from the first successful parse
            if detected_format == "unknown":
                detected_format = parsed.log_format
        else:
            # Collect up to 5 skipped samples
            if len(skipped_samples) < 5:
                skipped_samples.append(SkippedLineSample(
                    line_number=line_num,
                    content=line[:300] + ("..." if len(line) > 300 else ""),
                    reason="unmatched_log_format"
                ))

    parsed_lines = len(results)
    skipped_lines = total_lines - parsed_lines
    parse_rate = (parsed_lines / total_lines) if total_lines > 0 else 0.0
    
    # If explicit format requested, use that as detected_format
    if log_format != "auto":
        detected_format = log_format

    stats = ParseStats(
        total_lines=total_lines,
        parsed_lines=parsed_lines,
        skipped_lines=skipped_lines,
        parse_rate=round(parse_rate, 4),
        requested_format=log_format,
        detected_format=detected_format,
        skipped_samples=skipped_samples
    )
    
    return results, stats

def parse_file(file_path: str, log_format: str = "auto") -> List[LogEntry]:
    """
    Reads a log file and parses each line.
    """
    with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
        return parse_lines(f.readlines(), log_format=log_format)

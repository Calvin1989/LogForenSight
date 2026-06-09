import argparse
import sys
import os
from .service import analyze_log_file, analyze_log_file_sanitized
from .detector import DetectorConfig
from .config_loader import load_detector_config

def main() -> None:
    """
    Main entry point for the CLI tool.
    Parses arguments, executes analysis via service, and saves the report.
    """
    parser = argparse.ArgumentParser(description="LogForenSight - CLI")
    parser.add_argument("log_file", help="Path to the Nginx access log file")
    parser.add_argument("--output", "-o", help="Path to save the Markdown report", default="security_report.md")
    parser.add_argument("--rules", help="Path to rules.yaml configuration file")
    parser.add_argument("--format", choices=["auto", "nginx", "apache"], default="auto", help="Log format (default: auto)")
    parser.add_argument("--freq", type=int, help="Threshold for high frequency IP detection (overrides rules.yaml if provided)")
    parser.add_argument("--scan", type=int, help="Threshold for path scanning detection (overrides rules.yaml if provided)")
    parser.add_argument("--sanitized", action="store_true", help="Generate a sanitized report (redacts IPs and secrets)")
    
    args = parser.parse_args()

    if not os.path.exists(args.log_file):
        print(f"Error: File not found: {args.log_file}")
        sys.exit(1)

    # Configure detection rules
    try:
        config = load_detector_config(args.rules)
    except Exception as e:
        print(f"Error: Failed to load rules: {e}")
        sys.exit(1)
        
    if args.freq is not None:
        config.freq_threshold = args.freq
    if args.scan is not None:
        config.scan_threshold = args.scan

    print(f"[*] Analyzing log file: {args.log_file}...")
    try:
        # Call the service layer to perform analysis
        if args.sanitized:
            result = analyze_log_file_sanitized(args.log_file, config=config, log_format=args.format)
        else:
            result = analyze_log_file(args.log_file, config=config, log_format=args.format)
        
        # Save the generated markdown report
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(result.report_markdown)
        
        print(f"[+] Analysis complete! Report saved to: {args.output}")
        print("\n--- Quick Summary ---")
        print(f"Total Requests: {result.summary.total_requests}")
        print(f"Parsed Lines: {result.parse_stats.parsed_lines}")
        print(f"Skipped Lines: {result.parse_stats.skipped_lines}")
        print(f"Parse Rate: {result.parse_stats.parse_rate * 100:.2f}%")
        if result.parse_stats.skipped_lines > 0:
            print("[!] Note: Some lines were skipped. Samples are available in the Markdown report.")
        print(f"Risks Detected: {len(result.findings)}")
        print(f"Timeline Events: {len(result.timeline_events)}")
        
        # New severity distribution summary
        f_counts = result.summary.finding_severity_counts
        i_counts = result.summary.incident_severity_counts
        print(f"Finding Severity: high={f_counts.get('high', 0)}, medium={f_counts.get('medium', 0)}, low={f_counts.get('low', 0)}")
        print(f"Incident Severity: high={i_counts.get('high', 0)}, medium={i_counts.get('medium', 0)}, low={i_counts.get('low', 0)}")
        
    except Exception as e:
        print(f"Error: Analysis failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()

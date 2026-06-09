from datetime import datetime
from .schemas import AnalysisResult

def generate_markdown_report(result: AnalysisResult) -> str:
    """
    Renders an AnalysisResult into a Markdown security report.

    Args:
        result: An instance of AnalysisResult.

    Returns:
        A formatted Markdown string.
    """
    summary = result.summary
    findings = result.findings
    incidents = result.incidents
    stats = result.parse_stats
    exe_summary = result.executive_summary

    report = [
        "# AI Log Security Analysis Report",
        f"\nGenerated at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
    ]

    if exe_summary:
        severity_icon = {
            "informational": "ℹ️",
            "low": "🔵",
            "medium": "🟠",
            "high": "🔴",
            "critical": "🔥"
        }.get(exe_summary.overall_risk_level.lower(), "❓")

        report.extend([
            "\n## Executive Summary",
            f"### {severity_icon} {exe_summary.headline}",
            f"\n**Overall Risk Level:** {exe_summary.overall_risk_level.upper()} ({exe_summary.risk_score}/100)",
            f"\n{exe_summary.overview}",
            "\n#### Key Metrics",
        ])
        for metric in exe_summary.key_metrics:
            report.append(f"- {metric}")

        report.append("\n#### Top Risks")
        for risk in exe_summary.top_risks:
            report.append(f"- {risk}")

        report.append("\n#### Recommended Next Steps")
        for step in exe_summary.recommended_next_steps:
            report.append(f"- {step}")

        report.append(f"\n> **Methodology:** {exe_summary.methodology}")

    report.extend([
        "\n## 1. Overview Statistics",
        f"- **Total Requests:** {summary.total_requests}",
        f"- **Unique IPs:** {summary.unique_ips}",
        f"- **4xx Errors:** {summary.total_4xx}",
        f"- **5xx Errors:** {summary.total_5xx}",
        f"- **Security Incidents:** {len(incidents)}",
        f"- **Security Risks Found:** {len(findings)}",

        "\n## 2. Severity Distribution",
        "### Finding Severity Distribution",
        f"- **High:** {summary.finding_severity_counts.get('high', 0)}",
        f"- **Medium:** {summary.finding_severity_counts.get('medium', 0)}",
        f"- **Low:** {summary.finding_severity_counts.get('low', 0)}",
        "\n### Incident Severity Distribution",
        f"- **High:** {summary.incident_severity_counts.get('high', 0)}",
        f"- **Medium:** {summary.incident_severity_counts.get('medium', 0)}",
        f"- **Low:** {summary.incident_severity_counts.get('low', 0)}",
        
        "\n## 3. Parsing Quality",
        f"- **Total Lines (non-empty):** {stats.total_lines}",
        f"- **Successfully Parsed:** {stats.parsed_lines}",
        f"- **Skipped Lines:** {stats.skipped_lines}",
        f"- **Parse Rate:** {stats.parse_rate * 100:.2f}%",
        f"- **Log Format:** {stats.detected_format} (requested: {stats.requested_format})",
    ])

    if result.analysis_mode == "batch" and result.source_files:
        report.extend([
            "\n### Source Files Parsing Details",
            "| File | Total Lines | Parsed | Skipped | Parse Rate | Format |",
            "| :--- | :--- | :--- | :--- | :--- | :--- |"
        ])
        for source_file in result.source_files:
            report.append(
                f"| {source_file.filename} | {source_file.total_lines} | {source_file.parsed_lines} | "
                f"{source_file.skipped_lines} | {source_file.parse_rate * 100:.2f}% | {source_file.detected_format} |"
            )

    # Section 4: Attack Timeline
    report.append("\n## 4. Attack Timeline")
    timeline_events = result.timeline_events
    if not timeline_events:
        report.append("\nNo significant security events recorded in the timeline.")
    else:
        report.extend([
            "\n| Timestamp | Severity | Source IP | Title | Evidence (Snippet) |",
            "| :--- | :--- | :--- | :--- | :--- |"
        ])
        # Show max 20 events in the report
        for event in timeline_events[:20]:
            severity_label = {
                "low": "🔵 Low",
                "medium": "🟠 Medium",
                "high": "🔴 High"
            }.get(event.severity.lower(), event.severity.upper())
            
            # Truncate evidence for table
            evidence_snippet = (event.evidence[:50] + "...") if event.evidence and len(event.evidence) > 50 else (event.evidence or "-")
            
            report.append(f"| {event.timestamp} | {severity_label} | {event.source_ip} | {event.title} | {evidence_snippet} |")
        
        if len(timeline_events) > 20:
            report.append(f"\n*... and {len(timeline_events) - 20} more events (view full list in the application).*")
    
    if stats.skipped_lines > 0:
        report.append("\n> ⚠️ **Warning:** Some lines could not be parsed. Please verify the selected log format or check for custom log formats.")
        
        if stats.skipped_samples:
            report.append("\n### Skipped Line Samples")
            for sample in stats.skipped_samples:
                report.append(f"- **Line {sample.line_number}**: `{sample.content}`")
                report.append(f"  - *Reason*: {sample.reason}")

    report.extend([
        "\n## 5. Traffic Analysis",
        "\n### Top 5 IPs",
        "| IP Address | Request Count |",
        "| :--- | :--- |"
    ])
    for item in summary.top_ips:
        report.append(f"| {item['ip']} | {item['count']} |")

    report.extend([
        "\n### Top 5 Paths",
        "| Path | Request Count |",
        "| :--- | :--- |"
    ])
    for item in summary.top_paths:
        report.append(f"| {item['path']} | {item['count']} |")

    # Section 3: Security Incidents
    report.append("\n## 6. Security Incidents")
    if not incidents:
        report.append("\nNo significant security incidents aggregated.")
    else:
        for incident in incidents:
            severity_icon = {
                "low": "🔵 [Low]",
                "medium": "🟠 [Medium]",
                "high": "🔴 [High]"
            }.get(incident.severity.lower(), "[?]")
            
            report.append(f"\n### {severity_icon} {incident.title}")
            report.append(f"- **ID:** {incident.incident_id}")
            report.append(f"- **Source IP:** {incident.source_ip}")
            report.append(f"- **Confidence:** {incident.confidence}")
            report.append(f"- **Summary:** {incident.summary}")
            
            if incident.recommendations:
                report.append("\n**Recommendations:**")
                for rec in incident.recommendations:
                    report.append(f"- {rec}")

    # Section 4: Risk Findings
    report.append("\n## 7. Risk Findings")
    if not findings:
        report.append("\nNo specific risks detected.")
    else:
        for finding in findings:
            severity_icon = {
                "low": "🔵 [Low]",
                "medium": "🟠 [Medium]",
                "high": "🔴 [High]"
            }.get(finding.severity.lower(), "[?]")
            
            report.append(f"\n### {severity_icon} {finding.title}")
            report.append(f"- **Rule ID:** {finding.rule_id}")
            report.append(f"- **Description:** {finding.description}")
            
            report.append("\n**Matched Details:**")
            report.append(f"- **Matched Count:** {finding.matched_count}")
            report.append(f"- **Matched Fields:** {', '.join(finding.matched_fields)}")
            report.append(f"- **Matched Values:** {', '.join(finding.matched_values)}")
            
            if finding.evidence:
                report.append("\n**Evidence (Sample):**")
                for line in finding.evidence[:2]:
                    report.append(f"```\n{line}\n```")

    # Section 8: Rule Coverage
    report.append("\n## 8. Rule Coverage")
    rule_coverage = result.rule_coverage
    if not rule_coverage:
        report.append("\nNo rule coverage information available.")
    else:
        report.extend([
            "\n| Rule | Enabled | Triggered | Findings | Incidents | Matched Fields | Explanation |",
            "| :--- | :--- | :--- | :--- | :--- | :--- | :--- |"
        ])
        for item in rule_coverage:
            enabled_str = "✅ Yes" if item.enabled else "❌ No"
            triggered_str = "🎯 Yes" if item.triggered else "⚪ No"
            matched_fields_str = ", ".join(item.matched_fields) if item.matched_fields else "-"

            report.append(
                f"| {item.title} | {enabled_str} | {triggered_str} | {item.finding_count} | "
                f"{item.incident_count} | {matched_fields_str} | {item.explanation} |"
            )

    report.extend([
        "\n## 9. Remediation Suggestions",
        "- **Block High Risk IPs:** Consider blocking IPs that are scanning for sensitive paths or have excessive 404s.",
        "- **Rate Limiting:** Implement rate limiting for IPs showing high frequency behavior.",
        "- **Web Application Firewall (WAF):** Deploy a WAF to filter out suspicious User-Agents and known attack patterns.",
        "- **Hidden Paths:** Ensure sensitive files like `.env` and `.git` are not accessible from the web."
    ])

    return "\n".join(report)

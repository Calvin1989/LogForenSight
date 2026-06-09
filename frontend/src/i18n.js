import { ref, computed } from 'vue'

const STORAGE_KEY = 'ai-log-security-analyzer:language'
const DEFAULT_LANG = 'zh'

const currentLanguage = ref(localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG)

const messages = {
  zh: {
    app: {
      title: "AI Log Security Analyzer",
      subtitle: "上传 Nginx 访问日志进行安全分析",
      clearCurrentResult: "清除当前结果",
      rulesError: "注意：无法加载规则配置 ({error})。将使用默认配置。",
      error: "错误：{error}",
      topIps: "Top 5 IP",
      ipAddress: "IP 地址",
      topPaths: "Top 5 路径",
      path: "路径"
    },
    severity: {
      critical: "严重",
      high: "高危",
      medium: "中危",
      low: "低危",
      info: "提示",
      informational: "提示"
    },
    riskLevel: {
      critical: "极高风险",
      high: "高风险",
      medium: "中等风险",
      low: "低风险",
      safe: "安全",
      unknown: "未知"
    },
    actions: {
      upload: "上传",
      download: "下载",
      clear: "清除",
      copy: "复制",
      compare: "对比",
      view: "查看",
      analyze: "分析",
      analyzing: "分析中...",
      downloadMd: "下载 MD",
      downloadJson: "下载 JSON",
      downloadCsv: "下载 CSV",
      copyJson: "复制 JSON",
      hidePreview: "隐藏预览",
      showPreview: "显示预览",
      showLess: "收起",
      showAll: "显示全部",
      showAllEvidence: "显示全部证据",
      showAllMatchedValues: "显示所有匹配值"
    },
    common: {
      loading: "加载中...",
      noData: "暂无数据",
      emptyState: "尚未分析任何文件",
      count: "数量",
      severity: "严重程度",
      rule: "规则",
      all: "全部",
      search: "搜索",
      searchPlaceholder: "搜索...",
      sourceIp: "源 IP",
      line: "行",
      reason: "原因",
      description: "描述",
      recommendation: "建议",
      evidence: "证据",
      more: "更多",
      confidence: "置信度",
      fields: "字段",
      values: "值",
      status: "状态",
      timestamp: "时间戳",
      copied: "已复制！",
      copyFailed: "复制失败"
    },
    upload: {
      chooseFile: "选择 .log 或 .txt 文件",
      logFormat: "日志格式",
      autoDetect: "自动检测",
      selectedFiles: "已选择 {count} 个文件",
      analyzeFiles: "分析 {count} 个文件"
    },
    history: {
      title: "最近的分析",
      clearHistory: "清除历史记录",
      emptyState: "在此浏览器中未找到最近的分析记录。",
      parsed: "已解析",
      incidents: "个安全事件",
      findings: "个风险点",
      skipped: "个跳过",
      sanitizedCached: "已缓存脱敏结果",
      tuned: "已调优",
      batch: "批量"
    },
    summary: {
      title: "概览统计",
      totalRequests: "总请求数",
      uniqueIps: "唯一 IP 数",
      total4xx: "4xx 错误",
      total5xx: "5xx 错误"
    },
    executive: {
      title: "执行摘要 - Web 日志安全分析",
      keyMetrics: "核心指标",
      topRisks: "主要风险",
      keyAffectedIps: "受影响的主要 IP",
      noneDetected: "未检测到",
      recommendedNextSteps: "推荐的后续行动",
      methodology: "分析方法",
      overallRiskLevel: "整体风险等级"
    },
    distribution: {
      title: "严重程度分布",
      findingSeverity: "风险点严重程度",
      incidentSeverity: "安全事件严重程度"
    },
    timeline: {
      title: "攻击时间轴",
      intro: "按时间顺序排列的关键安全事件，有助于理解攻击过程。",
      showingEvents: "显示 {total} 个事件中的 {filtered} 个",
      emptyState: "时间轴中没有记录安全事件。",
      noMatch: "没有匹配筛选条件的事件。"
    },
    parse: {
      title: "解析质量",
      success: "成功",
      totalLines: "总行数",
      parsed: "已解析",
      skipped: "已跳过",
      format: "格式",
      requested: "请求格式",
      warning: "部分行无法解析。请验证选择的日志格式。",
      skippedSamples: "跳过的行示例",
      sourceFiles: "来源文件解析质量",
      filename: "文件名",
      parsedLines: "已解析行数",
      skippedLines: "跳过行数",
      parseRate: "解析率",
      detectedFormat: "识别格式"
    },
    incidents: {
      title: "聚合的安全事件",
      intro: "安全事件由相关风险点聚合而成，帮助分析人员了解整体攻击行为和意图。",
      allSeverities: "所有严重程度",
      showingIncidents: "显示 {total} 个安全事件中的 {filtered} 个",
      exportWarning: "⚠️ 原始 JSON/CSV 导出可能包含敏感的日志证据。共享前请检查。",
      emptyState: "未聚合到主要安全事件。",
      rulesInvolved: "涉及规则",
      recommendedActions: "推荐操作",
      evidenceSamples: "证据示例"
    },
    findings: {
      title: "安全风险点",
      allRules: "所有规则",
      searchPlaceholder: "标题、描述、证据...",
      showingFindings: "显示 {total} 个风险点中的 {filtered} 个",
      emptyState: "未检测到风险。",
      noMatch: "没有匹配筛选条件的风险点。",
      matchedDetails: "匹配详情",
      fields: "字段",
      values: "值"
    },
    report: {
      title: "Markdown 报告",
      downloadReport: "下载报告 (.md)",
      downloadSanitized: "下载脱敏报告 (.md)",
      downloadSummary: "下载摘要 (.json)",
      downloadEvidencePack: "下载证据包",
      warningBanner: "脱敏下载需要原始文件。请重新上传日志或使用带有缓存脱敏结果的历史记录。",
      infoBanner: "脱敏报告会屏蔽 IP 地址和敏感参数，以便更安全地共享。外部使用前请检查。"
    },
    evidencePack: {
      title: "分析师证据包",
      generatedAt: "生成时间",
      caseId: "案例 ID",
      analysisMode: "分析模式",
      severitySummary: "严重程度摘要",
      metric: "指标",
      value: "数值",
      riskScore: "风险评分",
      executiveSummary: "执行摘要",
      caseMetadata: "案例元数据",
      sourceName: "来源名称",
      createdAt: "创建时间",
      updatedAt: "更新时间",
      parseStats: "解析统计",
      sourceFiles: "来源文件信息",
      timelineHighlights: "时间轴重点",
      findingsList: "风险点列表",
      incidentsList: "安全事件列表",
      ruleCoverage: "规则覆盖",
      matchedRules: "已命中规则",
      unmatchedRules: "未命中规则",
      triageSummary: "处置摘要",
      triageDetails: "处置详情",
      totalTriagedItems: "已处置条目总数",
      statusDistribution: "状态分布",
      priorityDistribution: "优先级分布",
      investigationEntities: "调查实体",
      enabled: "已启用",
      yes: "是",
      no: "否",
      notAvailable: "暂无数据"
    },
    entities: {
      title: "调查实体",
      intro: "从当前分析结果中提取可调查的 IP、账号、URL、路径、HTTP 方法、状态码和来源文件。",
      type: "实体类型",
      value: "实体值",
      firstSeen: "首次出现",
      lastSeen: "最后出现",
      relatedSourceFiles: "相关来源文件",
      types: {
        account: "账号",
        http_method: "HTTP 方法",
        http_status: "HTTP 状态码",
        ip: "IP 地址",
        path: "路径",
        source_file: "来源文件",
        url: "URL"
      }
    },
    ruleConfig: {
      title: "当前生效的规则配置",
      highFrequencyThreshold: "高频访问阈值",
      requests: "个请求",
      pathScanningThreshold: "路径扫描阈值",
      sensitivePaths: "敏感路径",
      suspiciousUserAgents: "可疑 User-Agent"
    },
    comparison: {
      title: "报告对比",
      downloadReport: "下载对比报告 (Markdown)",
      atLeastTwo: "需要至少两个历史分析记录才能进行对比。目前仅有 {count} 条记录。",
      baseline: "基准报告 (Baseline)",
      selectBaseline: "请选择基准报告",
      target: "目标报告 (Target)",
      selectTarget: "请选择目标报告",
      startComparison: "开始对比",
      riskScoreDelta: "风险评分变化",
      findingsDelta: "风险点变化",
      incidentsDelta: "安全事件变化",
      parseRateDelta: "解析成功率变化",
      severityDistributionDelta: "严重程度分布变化",
      findingsChanges: "风险点变更 (Findings)",
      incidentsChanges: "安全事件变更 (Incidents)",
      added: "新增",
      removed: "消失",
      andOthers: "... 以及另外 {count} 个",
      noChanges: "无变化",
      findingsNoChanges: "风险点无变化",
      incidentsNoChanges: "安全事件无变化",
      riskUp: "安全风险显著上升",
      riskDown: "安全风险有所下降",
      riskStable: "安全风险保持稳定",
      overview: "对比分析显示，目标报告相对于基准报告，风险评分{action}了 {delta} 分。",
      increased: "增加",
      decreased: "减少",
      scoreChange: "风险评分变化了 {delta} 分。",
      findingsAdded: "新增了 {count} 个风险点。",
      incidentsAdded: "新增了 {count} 个安全事件。",
      findingsRemoved: "减少了 {count} 个旧风险点。",
      mdTitle: "安全分析对比报告",
      mdOverview: "概览",
      mdMetrics: "核心指标变化",
      mdSeverity: "严重程度分布变化",
      mdFindings: "风险点变更 (Findings)",
      mdIncidents: "安全事件变更 (Incidents)",
      mdConclusion: "结论与建议",
      mdConclusionSummary: "变化总结",
      mdActions: "推荐后续行动",
      mdGeneratedAt: "报告生成于"
    },
    ruleCoverage: {
      title: "规则覆盖与检测解释",
      subtitle: "展示分析中使用的安全检测规则及其命中情况。",
      totalRules: "总规则数",
      enabledRules: "已启用",
      triggeredRules: "已触发",
      notTriggeredRules: "未触发",
      findings: "风险点",
      incidents: "安全事件",
      matchedFields: "命中字段",
      matchedValues: "示例匹配值",
      sampleEvidence: "证据样例",
      explanation: "检测原理",
      copyJson: "复制 JSON",
      downloadJson: "下载 JSON",
      downloadMarkdown: "下载 Markdown",
      noData: "暂无规则覆盖数据",
      showEvidence: "显示证据",
      hideEvidence: "隐藏证据",
      filterAll: "全部规则",
      filterTriggered: "仅已触发",
      filterNotTriggered: "仅未触发"
    },
    workspace: {
      title: "案例工作区 (Saved Cases)",
      empty: "尚未保存任何案例",
      saveCase: "保存为案例",
      saved: "案例已保存",
      delete: "删除",
      export: "导出 JSON",
      import: "导入 JSON",
      search: "搜索标题或标签...",
      filterRisk: "按风险等级过滤",
      localOnly: "仅本地存储",
      noRawLogs: "不存储原始日志",
      caseTitle: "案例标题",
      notes: "备注",
      tags: "标签",
      batchCase: "批量案例",
      singleCase: "单文件案例",
      score: "分",
      findings: "个风险",
      incidents: "个事件",
      confirmDelete: "确定要删除此案例吗？",
      confirmClear: "确定要清除所有已保存案例吗？此操作不可撤销。",
      clearAll: "清除全部",
      importSuccess: "导入成功",
      importError: "导入失败，请检查文件格式",
      noMatches: "没有匹配筛选条件的案例"
    },
    triage: {
      title: "分析师处置工作流 (Analyst Triage)",
      empty: "尚未对任何风险或事件进行处置标记",
      status: "状态",
      priority: "优先级",
      notes: "处置备注",
      open: "待处理 (Open)",
      investigating: "调查中 (Investigating)",
      mitigated: "已修复 (Mitigated)",
      falsePositive: "误报 (False Positive)",
      low: "低 (Low)",
      medium: "中 (Medium)",
      high: "高 (High)",
      critical: "紧急 (Critical)",
      filterStatus: "按状态过滤",
      filterPriority: "按优先级过滤",
      exportMarkdown: "导出处置摘要 (Markdown)",
      localOnly: "仅本地存储状态",
      summary: "处置概览",
      updated: "更新于",
      finding: "风险点",
      incident: "安全事件",
      save: "保存状态",
      confirmClear: "确定要清除此案例的所有处置标记吗？"
    },
    ruleTuning: {
      title: "临时规则调优",
      subtitle: "调整参数并重新分析当前日志以观察结果变化。",
      temporaryNotice: "注意：此处修改仅影响本次预览，不会保存到 rules.yaml。",
      highFrequencyThreshold: "高频访问阈值",
      pathScanningThreshold: "路径扫描 404 阈值",
      sensitivePaths: "敏感路径列表 (每行一个，须以 / 开头)",
      suspiciousUserAgents: "可疑 User-Agent 列表 (每行一个)",
      disabledRules: "禁用规则",
      apply: "应用调优并重新分析",
      reset: "重置为默认",
      noFile: "请先上传日志后再进行规则调优",
      loading: "正在重新分析...",
      warnings: "调优警告",
      invalidThreshold: "阈值必须大于等于 1",
      placeholderPaths: "/admin\n/.env",
      placeholderUserAgents: "sqlmap\nnikto",
      rules: {
        high_frequency_ip: "高频访问请求",
        path_scanning: "路径扫描检测",
        sensitive_path_probe: "敏感路径探测",
        suspicious_user_agent: "可疑 User-Agent"
      },
      currentSummary: "当前调优摘要",
      activeRules: "个活跃规则",
      disabledRulesCount: "个已禁用规则",
      memoryOnly: "调优仅影响当前页面内存，不写入 rules.yaml",
      batchHint: "当前调优会应用于整个批量日志集合。"
    }
  },
  en: {
    app: {
      title: "AI Log Security Analyzer",
      subtitle: "Upload your Nginx access logs for security analysis",
      clearCurrentResult: "Clear Current Result",
      rulesError: "Note: Could not load rule configuration ({error}). Using defaults.",
      error: "Error: {error}",
      topIps: "Top 5 IPs",
      ipAddress: "IP Address",
      topPaths: "Top 5 Paths",
      path: "Path"
    },
    severity: {
      critical: "Critical",
      high: "High",
      medium: "Medium",
      low: "Low",
      info: "Info",
      informational: "Info"
    },
    riskLevel: {
      critical: "Critical",
      high: "High",
      medium: "Medium",
      low: "Low",
      safe: "Safe",
      unknown: "Unknown"
    },
    actions: {
      upload: "Upload",
      download: "Download",
      clear: "Clear",
      copy: "Copy",
      compare: "Compare",
      view: "View",
      analyze: "Analyze",
      analyzing: "Analyzing...",
      downloadMd: "Download MD",
      downloadJson: "Download JSON",
      downloadCsv: "Download CSV",
      copyJson: "Copy JSON",
      hidePreview: "Hide Preview",
      showPreview: "Show Preview",
      showLess: "Show less",
      showAll: "Show all",
      showAllEvidence: "Show all evidence",
      showAllMatchedValues: "Show all matched values"
    },
    common: {
      loading: "Loading...",
      noData: "No data available",
      emptyState: "No files analyzed yet",
      count: "Count",
      severity: "Severity",
      rule: "Rule",
      all: "All",
      search: "Search",
      searchPlaceholder: "Search...",
      sourceIp: "Source IP",
      line: "Line",
      reason: "Reason",
      description: "Description",
      recommendation: "Recommendation",
      evidence: "Evidence",
      more: "more",
      confidence: "Confidence",
      fields: "Fields",
      values: "Values",
      status: "Status",
      timestamp: "Timestamp",
      copied: "Copied!",
      copyFailed: "Copy failed"
    },
    upload: {
      chooseFile: "Choose a .log or .txt file",
      logFormat: "Log Format",
      autoDetect: "Auto Detect",
      selectedFiles: "{count} files selected",
      analyzeFiles: "Analyze {count} files"
    },
    history: {
      title: "Recent Analyses",
      clearHistory: "Clear History",
      emptyState: "No recent analysis records found in this browser.",
      parsed: "parsed",
      incidents: "incidents",
      findings: "findings",
      skipped: "skipped",
      sanitizedCached: "Sanitized cached",
      tuned: "Tuned",
      batch: "Batch"
    },
    summary: {
      title: "Overview Statistics",
      totalRequests: "Total Requests",
      uniqueIps: "Unique IPs",
      total4xx: "4xx Errors",
      total5xx: "5xx Errors"
    },
    executive: {
      title: "Executive Summary - Web Log Security Analysis",
      keyMetrics: "Key Metrics",
      topRisks: "Top Risks",
      keyAffectedIps: "Key Affected IPs",
      noneDetected: "None detected",
      recommendedNextSteps: "Recommended Next Steps",
      methodology: "Methodology",
      overallRiskLevel: "Overall Risk Level"
    },
    distribution: {
      title: "Severity Distribution",
      findingSeverity: "Finding Severity",
      incidentSeverity: "Incident Severity"
    },
    timeline: {
      title: "Attack Timeline",
      intro: "A chronological view of key security events to help understand the attack progression.",
      showingEvents: "Showing {filtered} of {total} events",
      emptyState: "No security events recorded in the timeline.",
      noMatch: "No events match your filters."
    },
    parse: {
      title: "Parsing Quality",
      success: "Success",
      totalLines: "Total Lines",
      parsed: "Parsed",
      skipped: "Skipped",
      format: "Format",
      requested: "Requested",
      warning: "Some lines could not be parsed. Please verify the selected log format.",
      skippedSamples: "Skipped Line Samples",
      sourceFiles: "Source Files",
      filename: "Filename",
      parsedLines: "Parsed Lines",
      skippedLines: "Skipped Lines",
      parseRate: "Parse Rate",
      detectedFormat: "Detected Format"
    },
    incidents: {
      title: "Aggregated Security Incidents",
      intro: "Incidents are grouped from related findings to help analysts understand overall attack behavior and intent.",
      allSeverities: "All Severities",
      showingIncidents: "Showing {filtered} of {total} incidents",
      exportWarning: "⚠️ Raw JSON/CSV exports may contain sensitive log evidence. Review before sharing.",
      emptyState: "No major security incidents aggregated.",
      rulesInvolved: "Rules Involved",
      recommendedActions: "Recommended Actions",
      evidenceSamples: "Evidence Samples"
    },
    findings: {
      title: "Security Findings",
      allRules: "All Rules",
      searchPlaceholder: "Title, desc, evidence...",
      showingFindings: "Showing {filtered} of {total}",
      emptyState: "No risks detected.",
      noMatch: "No findings match your filters.",
      matchedDetails: "Matched Details",
      fields: "Fields",
      values: "Values"
    },
    report: {
      title: "Markdown Report",
      downloadReport: "Download Report (.md)",
      downloadSanitized: "Download Sanitized (.md)",
      downloadSummary: "Download Summary (.json)",
      downloadEvidencePack: "Download Evidence Pack",
      warningBanner: "Sanitized download requires the original file. Please re-upload the log or use a history entry with cached sanitized result.",
      infoBanner: "Sanitized report masks IP addresses and sensitive parameters for safer sharing. Please review before external use."
    },
    evidencePack: {
      title: "Analyst Evidence Pack",
      generatedAt: "Generated timestamp",
      caseId: "Case ID",
      analysisMode: "Analysis mode",
      severitySummary: "Severity summary",
      metric: "Metric",
      value: "Value",
      riskScore: "Risk score",
      executiveSummary: "Executive summary",
      caseMetadata: "Case metadata",
      sourceName: "Source name",
      createdAt: "Created at",
      updatedAt: "Updated at",
      parseStats: "Parse stats",
      sourceFiles: "Source file information",
      timelineHighlights: "Timeline highlights",
      findingsList: "Findings list",
      incidentsList: "Incidents list",
      ruleCoverage: "Rule coverage",
      matchedRules: "Matched rules",
      unmatchedRules: "Unmatched rules",
      triageSummary: "Triage summary",
      triageDetails: "Triage details",
      totalTriagedItems: "Total triaged items",
      statusDistribution: "Status distribution",
      priorityDistribution: "Priority distribution",
      investigationEntities: "Investigation entities",
      enabled: "Enabled",
      yes: "Yes",
      no: "No",
      notAvailable: "Not available"
    },
    entities: {
      title: "Investigation Entities",
      intro: "Extracted local-first investigation entities from the current analysis result, including IPs, accounts, URLs, paths, HTTP methods, status codes, and source files.",
      type: "Entity Type",
      value: "Value",
      firstSeen: "First Seen",
      lastSeen: "Last Seen",
      relatedSourceFiles: "Related Source Files",
      types: {
        account: "Account",
        http_method: "HTTP Method",
        http_status: "HTTP Status",
        ip: "IP Address",
        path: "Path",
        source_file: "Source File",
        url: "URL"
      }
    },
    ruleConfig: {
      title: "Active Rule Configuration",
      highFrequencyThreshold: "High Frequency Threshold",
      requests: "requests",
      pathScanningThreshold: "Path Scanning Threshold",
      sensitivePaths: "Sensitive Paths",
      suspiciousUserAgents: "Suspicious User-Agents"
    },
    comparison: {
      title: "Report Comparison",
      downloadReport: "Download Comparison Report (Markdown)",
      atLeastTwo: "Need at least two history records to compare. Currently only {count} records.",
      baseline: "Baseline Report",
      selectBaseline: "Please select baseline",
      target: "Target Report",
      selectTarget: "Please select target",
      startComparison: "Start Comparison",
      riskScoreDelta: "Risk Score Change",
      findingsDelta: "Findings Change",
      incidentsDelta: "Incidents Change",
      parseRateDelta: "Parse Rate Change",
      severityDistributionDelta: "Severity Distribution Change",
      findingsChanges: "Findings Changes",
      incidentsChanges: "Incidents Changes",
      added: "Added",
      removed: "Removed",
      andOthers: "... and {count} others",
      noChanges: "No changes",
      findingsNoChanges: "No findings changes",
      incidentsNoChanges: "No incidents changes",
      riskUp: "Security risk increased significantly",
      riskDown: "Security risk decreased slightly",
      riskStable: "Security risk remained stable",
      overview: "Comparison shows risk score {action} by {delta} points compared to baseline.",
      increased: "increased",
      decreased: "decreased",
      scoreChange: "Risk score changed by {delta} points.",
      findingsAdded: "Added {count} new findings.",
      incidentsAdded: "Added {count} new incidents.",
      findingsRemoved: "Removed {count} old findings.",
      mdTitle: "Security Analysis Comparison Report",
      mdOverview: "Overview",
      mdMetrics: "Key Metrics Changes",
      mdSeverity: "Severity Distribution Changes",
      mdFindings: "Findings Changes",
      mdIncidents: "Incidents Changes",
      mdConclusion: "Conclusion & Recommendations",
      mdConclusionSummary: "Summary of Changes",
      mdActions: "Recommended Actions",
      mdGeneratedAt: "Report generated at"
    },
    ruleCoverage: {
      title: "Rule Coverage & Detection Explainability",
      subtitle: "Overview of security rules applied and their detection status.",
      totalRules: "Total Rules",
      enabledRules: "Enabled",
      triggeredRules: "Triggered",
      notTriggeredRules: "Not Triggered",
      findings: "Findings",
      incidents: "Incidents",
      matchedFields: "Matched Fields",
      matchedValues: "Sample Matched Values",
      sampleEvidence: "Sample Evidence",
      explanation: "Detection Explanation",
      copyJson: "Copy JSON",
      downloadJson: "Download JSON",
      downloadMarkdown: "Download Markdown",
      noData: "No rule coverage data available",
      showEvidence: "Show Evidence",
      hideEvidence: "Hide Evidence",
      filterAll: "All Rules",
      filterTriggered: "Triggered Only",
      filterNotTriggered: "Not Triggered Only"
    },
    workspace: {
      title: "Case Workspace",
      empty: "No saved cases yet",
      saveCase: "Save as Case",
      saved: "Case saved",
      delete: "Delete",
      export: "Export JSON",
      import: "Import JSON",
      search: "Search title or tags...",
      filterRisk: "Filter by Risk",
      localOnly: "Local Storage Only",
      noRawLogs: "No raw logs stored",
      caseTitle: "Case Title",
      notes: "Notes",
      tags: "Tags",
      batchCase: "Batch Case",
      singleCase: "Single Case",
      score: "pts",
      findings: "findings",
      incidents: "incidents",
      confirmDelete: "Are you sure you want to delete this case?",
      confirmClear: "Are you sure you want to clear all saved cases? This cannot be undone.",
      clearAll: "Clear All",
      importSuccess: "Import successful",
      importError: "Import failed, please check file format",
      noMatches: "No cases match your filters"
    },
    triage: {
      title: "Analyst Triage Workflow",
      empty: "No findings or incidents triaged yet",
      status: "Status",
      priority: "Priority",
      notes: "Analyst Notes",
      open: "Open",
      investigating: "Investigating",
      mitigated: "Mitigated",
      falsePositive: "False Positive",
      low: "Low",
      medium: "Medium",
      high: "High",
      critical: "Critical",
      filterStatus: "Filter by Status",
      filterPriority: "Filter by Priority",
      exportMarkdown: "Export Triage Summary (MD)",
      localOnly: "Local storage only",
      summary: "Triage Summary",
      updated: "Updated at",
      finding: "Finding",
      incident: "Incident",
      save: "Save Status",
      confirmClear: "Are you sure you want to clear all triage state for this case?"
    },
    ruleTuning: {
      title: "Temporary Rule Tuning",
      subtitle: "Adjust parameters and re-analyze current log to observe changes.",
      temporaryNotice: "Note: Changes here only affect this preview and are not saved to rules.yaml.",
      highFrequencyThreshold: "High Frequency Threshold",
      pathScanningThreshold: "Path Scanning 404 Threshold",
      sensitivePaths: "Sensitive Paths (one per line, must start with /)",
      suspiciousUserAgents: "Suspicious User-Agents (one per line)",
      disabledRules: "Disabled Rules",
      apply: "Apply Tuning & Re-analyze",
      reset: "Reset to Defaults",
      noFile: "Please upload a log file before tuning rules",
      loading: "Re-analyzing...",
      warnings: "Tuning Warnings",
      invalidThreshold: "Threshold must be at least 1",
      placeholderPaths: "/admin\n/.env",
      placeholderUserAgents: "sqlmap\nnikto",
      rules: {
        high_frequency_ip: "High Frequency Request",
        path_scanning: "Path Scanning Detected",
        sensitive_path_probe: "Sensitive Path Probing",
        suspicious_user_agent: "Suspicious User Agent"
      },
      currentSummary: "Current Tuning Summary",
      activeRules: "active rules",
      disabledRulesCount: "disabled rules",
      memoryOnly: "Tuning only affects current session and is not saved to rules.yaml",
      batchHint: "Current tuning applies to the entire batch log set."
    }
  }
};

export function setLanguage(lang) {
  if (messages[lang]) {
    currentLanguage.value = lang
    localStorage.setItem(STORAGE_KEY, lang)
  }
}

export function toggleLanguage() {
  const nextLang = currentLanguage.value === 'zh' ? 'en' : 'zh'
  setLanguage(nextLang)
}

function interpolate(value, params) {
  if (typeof value !== 'string' || !params) return value
  return value.replace(/\{(\w+)\}/g, (_, token) => {
    return token in params ? String(params[token]) : `{${token}}`
  })
}

export function t(key, paramsOrFallback = '', maybeFallback = '') {
  const params = (
    paramsOrFallback &&
    typeof paramsOrFallback === 'object' &&
    !Array.isArray(paramsOrFallback)
  ) ? paramsOrFallback : null
  const fallback = typeof paramsOrFallback === 'string'
    ? paramsOrFallback
    : (typeof maybeFallback === 'string' ? maybeFallback : '')
  const keys = key.split('.')
  let value = messages[currentLanguage.value]

  for (const k of keys) {
    if (value && value[k]) {
      value = value[k]
    } else {
      return fallback || key
    }
  }

  return interpolate(value, params)
}

export function translateSeverity(severity) {
  const s = severity?.toLowerCase()
  return t(`severity.${s}`, severity)
}

export function translateRiskLevel(level) {
  const l = level?.toLowerCase()
  return t(`riskLevel.${l}`, level)
}

export { currentLanguage }

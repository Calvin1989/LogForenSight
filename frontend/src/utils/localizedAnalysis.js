import { t, translateSeverity, translateRiskLevel } from '../i18n';

/**
 * Rules and Incident mapping for localization
 */
const RULE_MAP = {
  'high_frequency_ip': {
    zh: {
      title: '高频访问请求',
      description: 'IP {ip} 发起了 {count} 个请求，超过阈值 {threshold}。',
      recommendation: '建议启用速率限制；如果该行为持续出现，可考虑封禁该 IP。',
      explanation: '检测在当前日志中请求量异常偏高的来源 IP。'
    }
  },
  'path_scanning': {
    zh: {
      title: '检测到路径扫描',
      description: 'IP {ip} 产生了 {count} 个 404 错误，可能正在进行目录或路径扫描。',
      recommendation: '建议封禁该 IP，并检查被扫描的目标路径。',
      explanation: '检测大量 404 响应，用于识别可能的目录或路径扫描行为。'
    }
  },
  'sensitive_path_probe': {
    zh: {
      title: '敏感路径探测',
      description: 'IP {ip} 尝试访问敏感配置或管理路径。',
      recommendation: '建议立即调查并确认这些敏感路径是否可被公网访问。',
      explanation: '检测对敏感管理路径或配置文件路径的访问尝试。'
    }
  },
  'suspicious_user_agent': {
    zh: {
      title: '可疑 User-Agent',
      description: 'IP {ip} 使用了可疑或自动化 User-Agent。',
      recommendation: '建议监控该 IP；如果不是合法爬虫或内部工具，可考虑阻断。',
      explanation: '基于 User-Agent 特征检测自动化工具或可疑客户端。'
    }
  }
};

const INCIDENT_TITLE_MAP = {
  'Advanced Reconnaissance Activity': { zh: '高级侦察活动' },
  'Anomalous High Frequency Traffic': { zh: '异常高频访问流量' },
  'Sensitive Resource Probe': { zh: '敏感资源探测' },
  'Automated Tool Activity Detected': { zh: '检测到自动化工具活动' },
  'Intensive Directory Scanning': { zh: '密集目录扫描' }
};

const TIMELINE_TITLE_MAP = {
  'Sensitive Path Probe': { zh: '敏感路径探测' },
  'Directory Scanning Started': { zh: '目录扫描开始' },
  'Suspicious UA': { zh: '可疑 User-Agent' },
  'High Frequency Activity': { zh: '高频访问活动' },
  'Path Probe': { zh: '路径探测' },
  'Path Scanning': { zh: '路径扫描' },
  'Suspicious Ua': { zh: '可疑 User-Agent' },
  'High Frequency': { zh: '高频访问' }
};

/**
 * Deep clones an object and localizes its content for display.
 */
export function localizeAnalysisForDisplay(analysis, language) {
  if (!analysis || language === 'en') return analysis;

  const localized = JSON.parse(JSON.stringify(analysis));

  if (localized.executive_summary) {
    localized.executive_summary = localizeExecutiveSummary(localized.executive_summary, localized, language);
  }

  if (localized.findings) {
    localized.findings = localized.findings.map(f => localizeFinding(f, language));
  }

  if (localized.incidents) {
    localized.incidents = localized.incidents.map(inc => localizeIncident(inc, language));
  }

  if (localized.timeline_events) {
    localized.timeline_events = localized.timeline_events.map(ev => localizeTimelineEvent(ev, language));
  }

  if (localized.rule_coverage) {
    localized.rule_coverage = localized.rule_coverage.map(item => localizeRuleCoverage(item, language));
  }

  return localized;
}

export function localizeRuleCoverage(item, language) {
  if (language === 'en') return item;

  const mapping = RULE_MAP[item.rule_id];
  if (!mapping || !mapping[language]) return item;

  const localized = { ...item };
  localized.title = mapping[language].title;
  localized.description = mapping[language].explanation; // Using explanation as description for coverage view
  localized.explanation = mapping[language].explanation;

  return localized;
}

export function localizeExecutiveSummary(exec, fullAnalysis, language) {
  if (language === 'en') return exec;

  const incidentCount = fullAnalysis.incidents?.length || 0;
  const findingCount = fullAnalysis.findings?.length || 0;
  const totalRequests = fullAnalysis.summary?.total_requests || 0;
  const sourceIpCount = fullAnalysis.summary?.unique_ips || 0;
  const timelineCount = fullAnalysis.timeline_events?.length || 0;

  const headlineMap = {
    critical: '检测到极高风险 Web 攻击活动',
    high: '检测到高风险可疑访问行为',
    medium: '检测到中等风险安全活动',
    low: '检测到低风险安全风险点',
    informational: '未检测到明显安全风险'
  };

  const localizedExec = { ...exec };
  localizedExec.headline = headlineMap[exec.overall_risk_level?.toLowerCase()] || exec.headline;
  localizedExec.overview = `本次分析在 ${totalRequests} 条请求中识别出 ${incidentCount} 个安全事件和 ${findingCount} 个风险点。建议优先处理高危事件，并结合时间轴和证据进行复核。`;

  localizedExec.key_metrics = [
    `已分析请求总数：${totalRequests}`,
    `来源 IP 数：${sourceIpCount}`,
    `检测到的安全事件：${incidentCount}`,
    `独立风险点：${findingCount}`,
    `时间轴事件：${timelineCount}`
  ];

  localizedExec.top_risks = (exec.top_risks || []).map(risk => {
    // Attempt to translate the risk title if it's a known incident or finding title
    let translated = risk;
    for (const [en, map] of Object.entries(INCIDENT_TITLE_MAP)) {
      if (risk.includes(en)) {
        translated = risk.replace(en, map.zh).replace('(Incident)', '（安全事件）');
        break;
      }
    }
    // Also check rule titles
    for (const [id, map] of Object.entries(RULE_MAP)) {
      const enTitle = fullAnalysis.findings?.find(f => f.rule_id === id)?.title;
      if (enTitle && risk.includes(enTitle)) {
        translated = risk.replace(enTitle, map.zh.title).replace('(Finding)', '（风险点）');
        break;
      }
    }
    return translated;
  });

  localizedExec.recommended_next_steps = [
    '立即复核所有高危和极高风险安全事件。',
    '在防火墙或 WAF 层面阻断主要异常来源 IP。',
    '检查受影响路径是否存在配置错误或未授权访问风险。',
    '如果日志中出现 token、session、password、key、secret 等敏感参数，请轮换相关凭据。'
  ];

  localizedExec.methodology = '该摘要基于本地规则命中、安全事件、严重程度分布和攻击时间轴确定性生成。未使用 LLM，未调用外部 API。';

  return localizedExec;
}

export function localizeFinding(finding, language) {
  if (language === 'en') return finding;

  const mapping = RULE_MAP[finding.rule_id];
  if (!mapping || !mapping[language]) return finding;

  const localized = { ...finding };
  localized.title = mapping[language].title;

  // Replace placeholders in description
  let desc = mapping[language].description;
  const ip = finding.source_ip || (finding.matched_values && finding.matched_values[0]) || '{ip}';
  const count = finding.matched_count || (finding.matched_values ? finding.matched_values.length : '{count}');

  desc = desc.replace('{ip}', ip).replace('{count}', count).replace('{threshold}', '阈值');

  localized.description = desc;
  localized.recommendation = mapping[language].recommendation;

  return localized;
}

export function localizeIncident(incident, language) {
  if (language === 'en') return incident;

  const localized = { ...incident };
  localized.title = INCIDENT_TITLE_MAP[incident.title]?.[language] || incident.title;

  // For summary and recommendations, we provide generic but useful Chinese text
  // since these are often dynamically generated by the backend in English.
  if (language === 'zh') {
    const rules = (incident.related_rule_ids || []).join(', ');
    localized.summary = `检测到源自 ${incident.source_ip} 的异常活动${rules ? '，涉及规则：' + rules : ''}。该事件置信度为 ${translateRiskLevel(incident.confidence)}。`;
    localized.recommendations = [
      '对该来源 IP 进行进一步调查。',
      '根据业务需求评估是否需要封禁该 IP。',
      '检查受影响的系统路径和参数安全性。'
    ];
  }

  return localized;
}

export function localizeTimelineEvent(event, language) {
  if (language === 'en') return event;

  const localized = { ...event };

  // Match title patterns
  let translatedTitle = event.title;
  for (const [en, map] of Object.entries(TIMELINE_TITLE_MAP)) {
    if (event.title.startsWith(en)) {
      translatedTitle = event.title.replace(en, map.zh);
      break;
    }
  }
  localized.title = translatedTitle;

  // Localize description if possible
  if (language === 'zh' && event.description) {
    localized.description = event.description.replace('detected', '已检测到');
  }

  return localized;
}

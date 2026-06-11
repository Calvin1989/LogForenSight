import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { currentLanguage, setLanguage, toggleLanguage, t, translateSeverity, translateRiskLevel } from '../i18n'

describe('i18n tool', () => {
  beforeEach(() => {
    localStorage.clear()
    setLanguage('zh')
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('should have default language as zh', () => {
    expect(currentLanguage.value).toBe('zh')
  })

  it('should switch language and persist to localStorage', () => {
    setLanguage('en')
    expect(currentLanguage.value).toBe('en')
    expect(localStorage.getItem('LogForenSight:language')).toBe('en')
  })

  it('should toggle language', () => {
    expect(currentLanguage.value).toBe('zh')
    toggleLanguage()
    expect(currentLanguage.value).toBe('en')
    toggleLanguage()
    expect(currentLanguage.value).toBe('zh')
  })

  it('should translate nested keys', () => {
    setLanguage('zh')
    expect(t('app.title')).toBe('LogForenSight')
    expect(t('common.loading')).toBe('加载中...')

    setLanguage('en')
    expect(t('common.loading')).toBe('Loading...')
  })

  it('should return fallback or key if missing', () => {
    expect(t('missing.key')).toBe('missing.key')
    expect(t('missing.key', 'fallback text')).toBe('fallback text')
  })

  it('should replace count parameters in translations', () => {
    setLanguage('en')
    expect(t('upload.selectedFiles', { count: 3 })).toBe('3 files selected')

    setLanguage('zh')
    expect(t('upload.analyzeFiles', { count: 2 })).toBe('分析 2 个文件')
  })

  it('should translate severity correctly', () => {
    setLanguage('zh')
    expect(translateSeverity('critical')).toBe('严重')
    expect(translateSeverity('high')).toBe('高危')

    setLanguage('en')
    expect(translateSeverity('critical')).toBe('Critical')
  })

  it('should translate risk level correctly', () => {
    setLanguage('zh')
    expect(translateRiskLevel('critical')).toBe('极高风险')

    setLanguage('en')
    expect(translateRiskLevel('critical')).toBe('Critical')
  })

  it('should have ruleCoverage translations', () => {
    setLanguage('zh')
    expect(t('ruleCoverage.title')).toBe('规则覆盖与检测解释')
    expect(t('ruleCoverage.totalRules')).toBe('总规则数')

    setLanguage('en')
    expect(t('ruleCoverage.title')).toBe('Rule Coverage & Detection Explainability')
    expect(t('ruleCoverage.totalRules')).toBe('Total Rules')
  })

  it('should have ruleTuning translations', () => {
    setLanguage('zh')
    expect(t('ruleTuning.title')).toBe('临时规则调优')
    expect(t('ruleTuning.highFrequencyThreshold')).toBe('高频访问阈值')

    setLanguage('en')
    expect(t('ruleTuning.title')).toBe('Temporary Rule Tuning')
    expect(t('ruleTuning.highFrequencyThreshold')).toBe('High Frequency Threshold')
  })

  it('should have new batch-related translations', () => {
    setLanguage('zh')
    expect(t('history.batch')).toBe('批量')
    expect(t('parse.sourceFiles')).toBe('来源文件解析质量')
    expect(t('ruleTuning.batchHint')).toBe('当前调优会应用于整个批量日志集合。')

    setLanguage('en')
    expect(t('history.batch')).toBe('Batch')
    expect(t('parse.detectedFormat')).toBe('Detected Format')
    expect(t('ruleTuning.batchHint')).toBe('Current tuning applies to the entire batch log set.')
  })

  it('should have workspace translations', () => {
    setLanguage('zh')
    expect(t('workspace.title')).toBe('案例工作区 (Saved Cases)')
    expect(t('workspace.saveCase')).toBe('保存为案例')

    setLanguage('en')
    expect(t('workspace.title')).toBe('Case Workspace')
    expect(t('workspace.saveCase')).toBe('Save as Case')
  })

  it('should have triage translations', () => {
    setLanguage('zh')
    expect(t('triage.title')).toBe('分析师处置工作流 (Analyst Triage)')
    expect(t('triage.status')).toBe('状态')
    expect(t('triage.needsReview')).toBe('待复核')
    expect(t('triage.noRecords')).toBe('暂无处置记录')

    setLanguage('en')
    expect(t('triage.title')).toBe('Analyst Triage Workflow')
    expect(t('triage.status')).toBe('Status')
    expect(t('triage.needsReview')).toBe('Needs review')
    expect(t('triage.noRecords')).toBe('No triage records yet')
  })

  it('should have case notes translations in both languages', () => {
    setLanguage('zh')
    expect(t('caseNotes.title')).toBe('案件备注 / 决策日志')
    expect(t('caseNotes.empty')).toBe('暂无案件备注')
    expect(t('caseNotes.observation')).toBe('观察')
    expect(t('caseNotes.action')).toBe('处置动作')
    expect(t('caseNotes.evidencePackTitle')).toBe('分析师案件备注 / 决策日志')
    expect(t('caseNotes.noExportNotes')).toBe('暂无案件备注。')

    setLanguage('en')
    expect(t('caseNotes.title')).toBe('Case Notes / Decision Log')
    expect(t('caseNotes.empty')).toBe('No case notes yet')
    expect(t('caseNotes.observation')).toBe('Observation')
    expect(t('caseNotes.action')).toBe('Action')
    expect(t('caseNotes.evidencePackTitle')).toBe('Analyst Case Notes / Decision Log')
    expect(t('caseNotes.noExportNotes')).toBe('No analyst case notes recorded.')
  })

  it('should have evidence pack translations', () => {
    setLanguage('zh')
    expect(t('report.downloadEvidencePack')).toBe('下载证据包')
    expect(t('evidencePack.notAvailable')).toBe('暂无数据')
    expect(t('evidencePack.investigationEntities')).toBe('调查实体')

    setLanguage('en')
    expect(t('report.downloadEvidencePack')).toBe('Download Evidence Pack')
    expect(t('evidencePack.notAvailable')).toBe('Not available')
    expect(t('evidencePack.investigationEntities')).toBe('Investigation entities')
  })

  it('should have investigation entity translations', () => {
    setLanguage('zh')
    expect(t('entities.title')).toBe('调查实体')
    expect(t('entities.types.http_status')).toBe('HTTP 状态码')

    setLanguage('en')
    expect(t('entities.title')).toBe('Investigation Entities')
    expect(t('entities.types.source_file')).toBe('Source File')
  })

  it('should have detection explainability translations', () => {
    setLanguage('zh')
    expect(t('explainability.title')).toBe('检测可解释性 (Detection Explainability)')
    expect(t('explainability.ruleId')).toBe('规则 ID')
    expect(t('explainability.recommendedAction')).toBe('推荐分析师操作')
    expect(t('explainability.relatedEntities')).toBe('相关调查实体 (Related IOCs / Entities)')
    expect(t('explainability.recommendations.high')).toContain('优先复核')
    expect(t('explainability.recommendations.critical')).toContain('隔离')
    expect(t('explainability.rationale.critical')).toContain('严重')
    expect(t('explainability.indicatorKind.ip')).toBe('IP')
    expect(t('evidencePack.detectionExplainability')).toBe('检测可解释性 (Detection Explainability)')

    setLanguage('en')
    expect(t('explainability.title')).toBe('Detection Explainability')
    expect(t('explainability.ruleId')).toBe('Rule ID')
    expect(t('explainability.recommendedAction')).toBe('Recommended Analyst Action')
    expect(t('explainability.recommendations.high')).toContain('Prioritize review')
    expect(t('explainability.recommendations.critical')).toContain('isolate')
    expect(t('explainability.rationale.critical')).toContain('CRITICAL')
    expect(t('findings.showExplanation')).toBe('Show explanation')
    expect(t('findings.hideExplanation')).toBe('Hide explanation')
    expect(t('evidencePack.detectionExplainability')).toBe('Detection Explainability')
  })

  it('should have review readiness translations in both languages', () => {
    setLanguage('zh')
    expect(t('reviewReadiness.title')).toBe('调查复核准备度')
    expect(t('reviewReadiness.overallReady')).toBe('已准备就绪')
    expect(t('reviewReadiness.highRiskFindings')).toBe('高风险发现已复核')
    expect(t('reviewReadiness.incidents')).toBe('事件已复核')
    expect(t('reviewReadiness.entities')).toBe('调查实体已检查')
    expect(t('reviewReadiness.caseNotes')).toBe('分析师案件备注已记录')
    expect(t('reviewReadiness.evidencePack')).toBe('Evidence Pack 出包准备度')
    expect(t('reviewReadiness.empty')).toBe('运行分析后可查看调查复核准备度。')
    expect(t('reviewReadiness.readyToExport')).toContain('Evidence Pack')

    setLanguage('en')
    expect(t('reviewReadiness.title')).toBe('Investigation Review Readiness')
    expect(t('reviewReadiness.overallAttention')).toBe('Attention needed')
    expect(t('reviewReadiness.highRiskFindings')).toBe('High-risk findings reviewed')
    expect(t('reviewReadiness.incidents')).toBe('Incidents reviewed')
    expect(t('reviewReadiness.entities')).toBe('Investigation entities checked')
    expect(t('reviewReadiness.caseNotes')).toBe('Analyst case notes recorded')
    expect(t('reviewReadiness.evidencePack')).toBe('Evidence Pack readiness')
    expect(t('reviewReadiness.empty')).toBe('Run an analysis to review investigation readiness.')
    expect(t('reviewReadiness.readyToExport')).toContain('ready to export')
  })

  it('should have evidence pack quality translations in both languages', () => {
    setLanguage('zh')
    expect(t('evidencePackQuality.title')).toBe('Evidence Pack 质量评分')
    expect(t('evidencePackQuality.empty')).toBe('运行分析后可计算 Evidence Pack 质量评分。')
    expect(t('evidencePackQuality.statusReady')).toBe('就绪')
    expect(t('evidencePackQuality.highRiskReviewed')).toBe('高风险发现已复核')
    expect(t('evidencePackQuality.incidentsTriaged')).toBe('事件已完成 triage')
    expect(t('evidencePackQuality.caseNotesPresent')).toBe('Case Notes 已存在')
    expect(t('evidencePackQuality.entitiesPresent')).toBe('调查实体已存在')
    expect(t('evidencePackQuality.reviewReadinessReady')).toBe('Review Readiness 已就绪')
    expect(t('evidencePackQuality.notAvailableForExport')).toBe('当前导出未包含 Evidence Pack 质量评分。')

    setLanguage('en')
    expect(t('evidencePackQuality.title')).toBe('Evidence Pack Quality Score')
    expect(t('evidencePackQuality.empty')).toBe('Run an analysis to calculate Evidence Pack quality.')
    expect(t('evidencePackQuality.statusGood')).toBe('Good')
    expect(t('evidencePackQuality.statusPartial')).toBe('Partial')
    expect(t('evidencePackQuality.statusMissing')).toBe('Missing')
    expect(t('evidencePackQuality.highRiskReviewed')).toBe('High-risk findings reviewed')
    expect(t('evidencePackQuality.incidentsTriaged')).toBe('Incidents triaged')
    expect(t('evidencePackQuality.caseNotesPresent')).toBe('Case notes present')
    expect(t('evidencePackQuality.entitiesPresent')).toBe('Investigation entities present')
    expect(t('evidencePackQuality.reviewReadinessReady')).toBe('Review readiness ready')
    expect(t('evidencePackQuality.notAvailableForExport')).toBe('Evidence Pack quality score was not available for this export.')
  })

  it('should have evidence pack export guardrails translations in English', () => {
    setLanguage('en')
    expect(t('evidencePackGuardrails.title')).toBe('Evidence Pack Export Guardrails')
    expect(t('evidencePackGuardrails.empty')).toBe('Run an analysis to review Evidence Pack export guardrails.')
    expect(t('evidencePackGuardrails.statusReady')).toBe('Ready')
    expect(t('evidencePackGuardrails.statusReviewRecommended')).toBe('Review recommended')
    expect(t('evidencePackGuardrails.statusNotReady')).toBe('Not ready')
    expect(t('evidencePackGuardrails.notAvailableForExport')).toBe('Evidence Pack export guardrails were not available for this export.')
  })

  it('should have evidence pack export guardrails translations in Chinese with normal strings', () => {
    setLanguage('zh')

    const title = t('evidencePackGuardrails.title')
    const empty = t('evidencePackGuardrails.empty')
    const summary = t('evidencePackGuardrails.notReadySummary')
    const exportNote = t('evidencePackGuardrails.exportNotBlocked')

    expect(title).toBe('Evidence Pack 导出提示')
    expect(empty).toBe('运行分析后可查看 Evidence Pack 导出提示。')
    expect(summary).toContain('低质量导出风险')
    expect(exportNote).toContain('不会阻止导出')

    ;[title, empty, summary, exportNote].forEach((value) => {
      expect(value).not.toContain('\ufffd')
      expect(/[一-龥]/.test(value)).toBe(true)
    })
  })

  it('should have evidence pack preview translations in both languages', () => {
    setLanguage('zh')
    expect(t('evidencePackPreview.title')).toBe('Evidence Pack 导出预览')
    expect(t('evidencePackPreview.empty')).toBe('运行分析后可预览 Evidence Pack 导出内容。')
    expect(t('evidencePackPreview.showPreview')).toBe('显示预览')
    expect(t('evidencePackPreview.hidePreview')).toBe('隐藏预览')
    expect(t('evidencePackPreview.copyMarkdown')).toBe('复制 Markdown')
    expect(t('evidencePackPreview.copySection')).toBe('复制本章节')
    expect(t('evidencePackPreview.copySectionWithTitle', { title: '章节 A' })).toBe('复制章节：章节 A')
    expect(t('evidencePackPreview.copySuccess')).toBe('Markdown 已复制。')
    expect(t('evidencePackPreview.copyFailed')).toBe('复制失败，请手动选择并复制。')
    expect(t('evidencePackPreview.copySectionSuccess')).toBe('本章节已复制。')
    expect(t('evidencePackPreview.copySectionFailed')).toBe('本章节复制失败，请手动选择并复制。')
    expect(t('evidencePackPreview.previewLabel')).toBe('Markdown 预览')

    setLanguage('en')
    expect(t('evidencePackPreview.title')).toBe('Evidence Pack Export Preview')
    expect(t('evidencePackPreview.empty')).toBe('Run an analysis to preview the Evidence Pack export.')
    expect(t('evidencePackPreview.showPreview')).toBe('Show preview')
    expect(t('evidencePackPreview.hidePreview')).toBe('Hide preview')
    expect(t('evidencePackPreview.copyMarkdown')).toBe('Copy Markdown')
    expect(t('evidencePackPreview.copySection')).toBe('Copy section')
    expect(t('evidencePackPreview.copySectionWithTitle', { title: 'Section A' })).toBe('Copy section: Section A')
    expect(t('evidencePackPreview.copySuccess')).toBe('Markdown copied.')
    expect(t('evidencePackPreview.copyFailed')).toBe('Copy failed. Please select and copy manually.')
    expect(t('evidencePackPreview.copySectionSuccess')).toBe('Section copied.')
    expect(t('evidencePackPreview.copySectionFailed')).toBe('Section copy failed. Please select and copy manually.')
    expect(t('evidencePackPreview.previewLabel')).toBe('Markdown preview')
  })

  it('should have evidence pack share safety translations in both languages', () => {
    setLanguage('zh')
    expect(t('evidencePackShareSafety.title')).toBe('Evidence Pack 分享安全检查')
    expect(t('evidencePackShareSafety.statusSafe')).toBe('相对安全')
    expect(t('evidencePackShareSafety.statusReviewRecommended')).toBe('建议复核')
    expect(t('evidencePackShareSafety.statusAttention')).toBe('需要关注')
    expect(t('evidencePackShareSafety.findingUrlsWithQueryStrings', {
      count: 2,
      samples: 'https://a.example?a=1'
    })).toContain('带查询字符串的 URL')
    expect(t('evidencePackShareSafety.exportNotBlocked')).toContain('不会阻止导出')

    setLanguage('en')
    expect(t('evidencePackShareSafety.title')).toBe('Evidence Pack Share Safety Review')
    expect(t('evidencePackShareSafety.statusSafe')).toBe('Safe')
    expect(t('evidencePackShareSafety.statusReviewRecommended')).toBe('Review recommended')
    expect(t('evidencePackShareSafety.statusAttention')).toBe('Attention')
    expect(t('evidencePackShareSafety.findingUrlsWithQueryStrings', {
      count: 2,
      samples: 'https://a.example?a=1'
    })).toContain('URLs with query strings')
    expect(t('evidencePackShareSafety.exportNotBlocked')).toContain('does not block export')
  })

  it('should keep evidence pack share safety Chinese strings readable', () => {
    setLanguage('zh')

    const values = [
      t('evidencePackShareSafety.title'),
      t('evidencePackShareSafety.empty'),
      t('evidencePackShareSafety.summaryAttention'),
      t('evidencePackShareSafety.warningHighExposureIndicators'),
      t('evidencePackShareSafety.recommendationTrimRawEvidence')
    ]

    values.forEach((value) => {
      expect(value).not.toContain('\ufffd')
      expect(/[一-龥]/.test(value)).toBe(true)
    })
  })
})

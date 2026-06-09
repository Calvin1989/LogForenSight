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
    expect(localStorage.getItem('ai-log-security-analyzer:language')).toBe('en')
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
    expect(t('app.title')).toBe('AI Log Security Analyzer')
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

    setLanguage('en')
    expect(t('triage.title')).toBe('Analyst Triage Workflow')
    expect(t('triage.status')).toBe('Status')
  })
})

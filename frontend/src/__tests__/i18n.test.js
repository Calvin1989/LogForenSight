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
})

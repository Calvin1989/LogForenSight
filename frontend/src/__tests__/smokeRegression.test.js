import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { setLanguage, t } from '../i18n'
import FileUpload from '../components/FileUpload.vue'
import RecentAnalyses from '../components/RecentAnalyses.vue'
import EvidencePackExportPreview from '../components/EvidencePackExportPreview.vue'
import MarkdownReport from '../components/MarkdownReport.vue'

const mockResult = {
  executive_summary: { headline: 'Test', overall_risk_level: 'low', overview: 'Test overview' },
  findings: [],
  incidents: [],
  summary: {
    total_requests: 0,
    unique_ips: 0,
    finding_severity_counts: {},
    incident_severity_counts: {},
    top_ips: [],
    top_paths: []
  },
  parse_stats: { parse_rate: 0, total_lines: 0, parsed_lines: 0 },
  timeline_events: [],
  report_markdown: '# Report\n\n## Section\n\nContent.',
  rule_coverage: []
}

describe('Smoke: FileUpload loading/disabled/error states', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('analyze button has aria-busy when loading', () => {
    const wrapper = mount(FileUpload, { props: { loading: true, error: '' } })
    const btn = wrapper.find('[data-testid="analyze-btn"]')
    expect(btn.attributes('aria-busy')).toBe('true')
    expect(btn.element.disabled).toBe(true)
    expect(btn.attributes('aria-disabled')).toBe('true')
  })

  it('analyze button does not have aria-busy when not loading', () => {
    const wrapper = mount(FileUpload, { props: { loading: false, error: '' } })
    const btn = wrapper.find('[data-testid="analyze-btn"]')
    expect(btn.attributes('aria-busy')).toBe('false')
  })

  it('shows loading status when loading', () => {
    const wrapper = mount(FileUpload, { props: { loading: true, error: '' } })
    const status = wrapper.find('[data-testid="upload-loading-status"]')
    expect(status.exists()).toBe(true)
    expect(status.text()).toContain('Analysis in progress')
  })

  it('hides loading status when not loading', () => {
    const wrapper = mount(FileUpload, { props: { loading: false, error: '' } })
    expect(wrapper.find('[data-testid="upload-loading-status"]').exists()).toBe(false)
  })

  it('shows error callout when error is present and not loading', () => {
    const wrapper = mount(FileUpload, { props: { loading: false, error: 'Network error' } })
    const callout = wrapper.find('[data-testid="upload-error-callout"]')
    expect(callout.exists()).toBe(true)
    expect(callout.attributes('role')).toBe('alert')
    expect(callout.text()).toContain('Analysis failed')
    expect(callout.text()).toContain('Network error')
    expect(callout.text()).toContain('retry')
  })

  it('hides error callout when loading', () => {
    const wrapper = mount(FileUpload, { props: { loading: true, error: 'Network error' } })
    expect(wrapper.find('[data-testid="upload-error-callout"]').exists()).toBe(false)
  })

  it('hides error callout when no error', () => {
    const wrapper = mount(FileUpload, { props: { loading: false, error: '' } })
    expect(wrapper.find('[data-testid="upload-error-callout"]').exists()).toBe(false)
  })

  it('error callout has title, reason, and hint structure', () => {
    const wrapper = mount(FileUpload, { props: { loading: false, error: 'Server down' } })
    const callout = wrapper.find('[data-testid="upload-error-callout"]')
    expect(callout.find('.error-title').exists()).toBe(true)
    expect(callout.find('.error-reason').exists()).toBe(true)
    expect(callout.find('.error-hint').exists()).toBe(true)
    expect(callout.find('.error-reason').text()).toBe('Server down')
  })
})

describe('Smoke: RecentAnalyses compact status metadata', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('shows success status for normal records', () => {
    const wrapper = mount(RecentAnalyses, {
      props: {
        history: [{
          id: '1',
          analyzed_at: '2026-06-09T10:00:00.000Z',
          file_name: 'access.log',
          log_format: 'combined',
          parse_rate: 0.95,
          incidents_count: 0,
          findings_count: 0,
          skipped_lines: 0
        }]
      }
    })
    expect(wrapper.find('[data-testid="history-status-success"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="history-status-failed"]').exists()).toBe(false)
  })

  it('shows failed status for failed records', () => {
    const wrapper = mount(RecentAnalyses, {
      props: {
        history: [{
          id: '2',
          analyzed_at: '2026-06-09T10:00:00.000Z',
          file_name: 'broken.log',
          status: 'failed',
          parse_rate: 0,
          incidents_count: 0,
          findings_count: 0,
          skipped_lines: 0
        }]
      }
    })
    expect(wrapper.find('[data-testid="history-status-failed"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="history-status-success"]').exists()).toBe(false)
    expect(wrapper.find('.history-item.is-failed').exists()).toBe(true)
  })

  it('history items have data-testid', () => {
    const wrapper = mount(RecentAnalyses, {
      props: {
        history: [{
          id: 'test-123',
          analyzed_at: '2026-06-09T10:00:00.000Z',
          file_name: 'access.log',
          parse_rate: 1,
          incidents_count: 0,
          findings_count: 0,
          skipped_lines: 0
        }]
      }
    })
    expect(wrapper.find('[data-testid="history-item-test-123"]').exists()).toBe(true)
  })
})

describe('Smoke: EvidencePackExportPreview no data state', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('shows structured empty state when no result', () => {
    const wrapper = mount(EvidencePackExportPreview, { props: { result: null } })
    const empty = wrapper.find('[data-testid="evidence-pack-preview-empty"]')
    expect(empty.exists()).toBe(true)
    expect(empty.find('h4').exists()).toBe(true)
    expect(empty.find('p').exists()).toBe(true)
    expect(empty.find('p').text()).toContain('Complete an analysis')
  })

  it('preview actions exist but buttons are disabled when no result', () => {
    const wrapper = mount(EvidencePackExportPreview, { props: { result: null } })
    const actions = wrapper.find('[data-testid="evidence-pack-preview-actions"]')
    expect(actions.exists()).toBe(true)
    const btns = actions.findAll('button')
    btns.forEach((btn) => {
      expect(btn.element.disabled).toBe(true)
    })
  })

  it('copy markdown button is disabled when no result', () => {
    const wrapper = mount(EvidencePackExportPreview, { props: { result: null } })
    const btn = wrapper.find('[data-testid="copy-markdown-btn"]')
    expect(btn.element.disabled).toBe(true)
    expect(btn.attributes('aria-disabled')).toBe('true')
  })
})

describe('Smoke: MarkdownReport unavailable states', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('shows unavailable banner when no report markdown', () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: '',
        result: null,
        sanitizedAvailable: true
      }
    })
    const banner = wrapper.find('[data-testid="report-unavailable-banner"]')
    expect(banner.exists()).toBe(true)
    expect(banner.text()).toContain('unavailable')
  })

  it('hides unavailable banner when report exists', () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: '# Report',
        result: mockResult,
        sanitizedAvailable: true
      }
    })
    expect(wrapper.find('[data-testid="report-unavailable-banner"]').exists()).toBe(false)
  })

  it('download buttons are disabled when no data', () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: '',
        result: null,
        sanitizedAvailable: false
      }
    })
    const reportBtn = wrapper.find('[data-testid="download-report-btn"]')
    expect(reportBtn.exists()).toBe(true)
    expect(reportBtn.element.disabled).toBe(true)

    const sanitizedBtn = wrapper.find('[data-testid="download-sanitized-btn"]')
    expect(sanitizedBtn.exists()).toBe(true)
    expect(sanitizedBtn.element.disabled).toBe(true)
  })

  it('download buttons are enabled when data exists', () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: '# Report',
        result: mockResult,
        sanitizedAvailable: true
      }
    })
    const reportBtn = wrapper.find('[data-testid="download-report-btn"]')
    expect(reportBtn.element.disabled).toBe(false)

    const sanitizedBtn = wrapper.find('[data-testid="download-sanitized-btn"]')
    expect(sanitizedBtn.element.disabled).toBe(false)
  })

  it('preview toggle is disabled when no report', () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: '',
        result: null,
        sanitizedAvailable: true
      }
    })
    const toggle = wrapper.find('[data-testid="toggle-preview-btn"]')
    expect(toggle.element.disabled).toBe(true)
  })
})

describe('Smoke: i18n new keys exist in both languages', () => {
  const newKeys = [
    'common.retry',
    'common.error',
    'common.unavailable',
    'upload.analysisInProgress',
    'upload.analysisFailed',
    'upload.backendUnavailable',
    'upload.unsupportedFormat',
    'upload.emptyFile',
    'upload.retryHint',
    'evidencePackPreview.unavailableHint',
    'report.previewUnavailable',
    'history.statusFailed'
  ]

  it('all new keys have zh translations', () => {
    setLanguage('zh')
    newKeys.forEach((key) => {
      const value = t(key)
      expect(value).not.toBe(key)
      expect(value.length).toBeGreaterThan(0)
    })
  })

  it('all new keys have en translations', () => {
    setLanguage('en')
    newKeys.forEach((key) => {
      const value = t(key)
      expect(value).not.toBe(key)
      expect(value.length).toBeGreaterThan(0)
    })
  })

  it('new zh keys contain Chinese characters', () => {
    setLanguage('zh')
    const chineseKeys = [
      'common.retry',
      'common.error',
      'common.unavailable',
      'upload.analysisInProgress',
      'upload.analysisFailed',
      'upload.backendUnavailable',
      'upload.unsupportedFormat',
      'upload.emptyFile',
      'upload.retryHint',
      'evidencePackPreview.unavailableHint',
      'report.previewUnavailable',
      'history.statusFailed'
    ]
    chineseKeys.forEach((key) => {
      const value = t(key)
      expect(/[一-龥]/.test(value)).toBe(true)
    })
  })

  it('new en keys contain English text', () => {
    setLanguage('en')
    const englishKeys = [
      'common.retry',
      'common.error',
      'common.unavailable',
      'upload.analysisFailed',
      'upload.backendUnavailable',
      'history.statusFailed'
    ]
    englishKeys.forEach((key) => {
      const value = t(key)
      expect(/[a-zA-Z]/.test(value)).toBe(true)
    })
  })
})

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { setLanguage } from '../i18n'
import FileUpload from '../components/FileUpload.vue'
import MarkdownReport from '../components/MarkdownReport.vue'
import EvidencePackExportPreview from '../components/EvidencePackExportPreview.vue'
import CaseNotesPanel from '../components/CaseNotesPanel.vue'
import CaseClosureChecklist from '../components/CaseClosureChecklist.vue'
import CaseClosureEvidenceGaps from '../components/CaseClosureEvidenceGaps.vue'
import CaseClosureNextActions from '../components/CaseClosureNextActions.vue'
import FindingsList from '../components/FindingsList.vue'
import IncidentsList from '../components/IncidentsList.vue'
import TimelineView from '../components/TimelineView.vue'
import InvestigationEntities from '../components/InvestigationEntities.vue'

let noteStore = {}

vi.mock('../utils/caseNotesStorage', () => ({
  NOTE_TYPES: ['observation', 'hypothesis', 'action', 'decision'],
  loadCaseNotes: vi.fn((caseId = 'default') => [...(noteStore[caseId || 'default'] || [])]),
  addCaseNote: vi.fn((caseId = 'default', note) => {
    const key = caseId || 'default'
    const newNote = {
      id: `note-${Date.now()}`,
      type: note.type,
      title: note.title,
      body: note.body,
      createdAt: '2026-06-10T10:00:00.000Z',
      updatedAt: '2026-06-10T10:00:00.000Z'
    }
    noteStore[key] = [newNote, ...(noteStore[key] || [])]
    return [...noteStore[key]]
  }),
  updateCaseNote: vi.fn((caseId = 'default', noteId, patch) => {
    const key = caseId || 'default'
    noteStore[key] = (noteStore[key] || []).map((note) => (
      note.id === noteId
        ? { ...note, ...patch, updatedAt: '2026-06-10T11:00:00.000Z' }
        : note
    ))
    return [...noteStore[key]]
  }),
  deleteCaseNote: vi.fn((caseId = 'default', noteId) => {
    const key = caseId || 'default'
    noteStore[key] = (noteStore[key] || []).filter((note) => note.id !== noteId)
    return [...noteStore[key]]
  })
}))

describe('UX regression: FileUpload button states', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('analyze button is disabled when no files selected', () => {
    const wrapper = mount(FileUpload, { props: { loading: false } })
    const btn = wrapper.find('[data-testid="analyze-btn"]')
    expect(btn.exists()).toBe(true)
    expect(btn.element.disabled).toBe(true)
    expect(btn.attributes('aria-disabled')).toBe('true')
  })

  it('shows upload hint when no files selected', () => {
    const wrapper = mount(FileUpload, { props: { loading: false } })
    const hint = wrapper.find('[data-testid="upload-hint"]')
    expect(hint.exists()).toBe(true)
    expect(hint.text()).toContain('Select log files')
  })

  it('analyze button has loading class when loading', () => {
    const wrapper = mount(FileUpload, { props: { loading: true } })
    const btn = wrapper.find('[data-testid="analyze-btn"]')
    expect(btn.classes()).toContain('is-loading')
  })

  it('file label has data-testid', () => {
    const wrapper = mount(FileUpload, { props: { loading: false } })
    expect(wrapper.find('[data-testid="file-label"]').exists()).toBe(true)
  })
})

describe('UX regression: MarkdownReport preview container', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  const mockResult = {
    executive_summary: { headline: 'Test', overall_risk_level: 'critical', overview: 'Test overview' },
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
    timeline_events: []
  }

  it('preview container has bounded scroll styling', () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: '# Report\n\n## Section\n\nContent here.',
        result: mockResult
      }
    })
    const preview = wrapper.find('[data-testid="report-preview-container"]')
    expect(preview.exists()).toBe(true)
    expect(preview.classes()).toContain('report-preview-container')
  })

  it('toggle preview button has aria-label', () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: '# Report\n\nContent.',
        result: mockResult
      }
    })
    const btn = wrapper.find('[data-testid="toggle-preview-btn"]')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('aria-label')).toBeTruthy()
  })

  it('download sanitized button has data-testid', () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: '# Report\n\nContent.',
        result: mockResult
      }
    })
    const btn = wrapper.find('[data-testid="download-sanitized-btn"]')
    expect(btn.exists()).toBe(true)
  })

  it('shows disabled hint when sanitized not available', () => {
    const wrapper = mount(MarkdownReport, {
      props: {
        reportMarkdown: '# Report\n\nContent.',
        result: mockResult,
        sanitizedAvailable: false
      }
    })
    expect(wrapper.find('.disabled-hint').exists()).toBe(true)
  })
})

describe('UX regression: EvidencePackExportPreview empty and feedback', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('empty state has structured content with data-testid', () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: { result: null }
    })
    const empty = wrapper.find('[data-testid="evidence-pack-preview-empty"]')
    expect(empty.exists()).toBe(true)
    expect(empty.find('h4').exists()).toBe(true)
    expect(empty.find('p').exists()).toBe(true)
  })

  it('copy markdown button has aria-label and data-testid', () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: {
        result: {
          executive_summary: { headline: 'Test', overall_risk_level: 'low', overview: 'Test' },
          findings: [],
          incidents: [],
          summary: { total_requests: 0, unique_ips: 0, finding_severity_counts: {}, incident_severity_counts: {}, top_ips: [], top_paths: [] },
          parse_stats: { parse_rate: 0, total_lines: 0, parsed_lines: 0 },
          timeline_events: [],
          report_markdown: '# Test',
          rule_coverage: []
        }
      }
    })
    const btn = wrapper.find('[data-testid="copy-markdown-btn"]')
    expect(btn.exists()).toBe(true)
    expect(btn.attributes('aria-label')).toBeTruthy()
  })

  it('section copy button has aria-label', () => {
    const wrapper = mount(EvidencePackExportPreview, {
      props: {
        result: {
          executive_summary: { headline: 'Test', overall_risk_level: 'low', overview: 'Test' },
          findings: [],
          incidents: [],
          summary: { total_requests: 0, unique_ips: 0, finding_severity_counts: {}, incident_severity_counts: {}, top_ips: [], top_paths: [] },
          parse_stats: { parse_rate: 0, total_lines: 0, parsed_lines: 0 },
          timeline_events: [],
          report_markdown: '# Test\n\n## Section\n\nContent.',
          rule_coverage: []
        }
      }
    })

    wrapper.find('.preview-btn').trigger('click')
    const sectionBtns = wrapper.findAll('[data-testid="copy-section-button"]')
    sectionBtns.forEach((btn) => {
      expect(btn.attributes('aria-label')).toBeTruthy()
    })
  })
})

describe('UX regression: CaseNotesPanel empty state and save feedback', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    noteStore = {}
    setLanguage('en')
  })

  it('empty state has structured content with h4 and p', () => {
    const wrapper = mount(CaseNotesPanel, {
      props: { caseId: 'case-1' }
    })
    const empty = wrapper.find('[data-testid="case-notes-empty"]')
    expect(empty.exists()).toBe(true)
    expect(empty.find('h4').exists()).toBe(true)
    expect(empty.find('p').exists()).toBe(true)
  })

  it('save button has data-testid', async () => {
    const wrapper = mount(CaseNotesPanel, {
      props: { caseId: 'case-1' }
    })
    await wrapper.find('.primary-btn').trigger('click')
    await wrapper.vm.$nextTick()
    const saveBtn = wrapper.find('[data-testid="save-note-btn"]')
    expect(saveBtn.exists()).toBe(true)
  })

  it('shows save feedback after saving a note', async () => {
    const wrapper = mount(CaseNotesPanel, {
      props: { caseId: 'case-1' }
    })
    await wrapper.find('.primary-btn').trigger('click')
    await wrapper.vm.$nextTick()
    await wrapper.find('input').setValue('Test note')
    await wrapper.find('textarea').setValue('Test body')
    await wrapper.find('[data-testid="save-note-btn"]').trigger('click')
    await wrapper.vm.$nextTick()

    const feedbackContainer = wrapper.find('[data-testid="save-feedback"]')
    expect(feedbackContainer.exists()).toBe(true)
    const feedbackText = feedbackContainer.find('.save-feedback')
    expect(feedbackText.exists()).toBe(true)
    expect(feedbackText.text()).toBeTruthy()
  })
})

describe('UX regression: CaseClosure sibling flow', () => {
  beforeEach(() => {
    localStorage.clear()
    setLanguage('en')
  })

  it('Checklist, EvidenceGaps, and NextActions all render with data-testid', () => {
    const checklistData = {
      result: { findings: [], incidents: [] },
      displayResult: { findings: [], incidents: [], timeline_events: [], rule_coverage: [] },
      caseNotes: [],
      reviewReadiness: { status: 'ready', summary: { requiredBlockers: 0, highRiskFindings: { reviewed: 0, total: 0 }, incidents: { reviewed: 0, total: 0 } } },
      evidencePackQuality: { score: 90, status: 'ready', summary: { maxScore: 100 } },
      exportGuardrails: { decision: 'ready', summaryKey: 'evidencePackGuardrails.readySummary' },
      shareSafety: { status: 'safe', findings: [], warnings: [] }
    }

    const readinessGrid = document.createElement('div')
    readinessGrid.setAttribute('data-testid', 'readiness-grid')

    const checklist = mount(CaseClosureChecklist, { props: checklistData, attachTo: readinessGrid })
    const gaps = mount(CaseClosureEvidenceGaps, { props: { gapItems: [] }, attachTo: readinessGrid })
    const actions = mount(CaseClosureNextActions, { props: { gapItems: [], handoffReadiness: { value: 'Ready' } }, attachTo: readinessGrid })

    expect(checklist.find('[data-testid="case-closure-checklist"]').exists()).toBe(true)
    expect(gaps.find('[data-testid="case-closure-evidence-gaps"]').exists()).toBe(true)
    expect(actions.find('[data-testid="case-closure-next-actions"]').exists()).toBe(true)

    checklist.unmount()
    gaps.unmount()
    actions.unmount()
  })
})

describe('UX regression: Empty states use unified structure', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('FindingsList empty state uses dashed border class', () => {
    const wrapper = mount(FindingsList, {
      props: { findings: [] }
    })
    const empty = wrapper.find('.empty-state')
    expect(empty.exists()).toBe(true)
    expect(empty.classes()).toContain('empty-state')
  })

  it('IncidentsList empty state uses dashed border class', () => {
    const wrapper = mount(IncidentsList, {
      props: { incidents: [] }
    })
    const empty = wrapper.find('.empty-state')
    expect(empty.exists()).toBe(true)
    expect(empty.classes()).toContain('empty-state')
  })

  it('TimelineView empty state uses dashed border class', () => {
    const wrapper = mount(TimelineView, {
      props: { timelineEvents: [] }
    })
    const empty = wrapper.find('.empty-state')
    expect(empty.exists()).toBe(true)
    expect(empty.classes()).toContain('empty-state')
  })

  it('InvestigationEntities empty state renders', () => {
    const wrapper = mount(InvestigationEntities, {
      props: {
        analysisResult: { findings: [], incidents: [], timeline_events: [] }
      }
    })
    expect(wrapper.find('.empty-state').exists()).toBe(true)
  })
})

describe('UX regression: Filter controls have labels', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('FindingsList filter selects have id for label association', () => {
    const wrapper = mount(FindingsList, {
      props: { findings: [] }
    })
    expect(wrapper.find('#findings-severity-filter').exists()).toBe(true)
    expect(wrapper.find('#findings-rule-filter').exists()).toBe(true)
    expect(wrapper.find('#findings-text-search').exists()).toBe(true)
  })

  it('IncidentsList filter controls have id for label association', () => {
    const wrapper = mount(IncidentsList, {
      props: { incidents: [] }
    })
    expect(wrapper.find('#incidents-severity-filter').exists()).toBe(true)
    expect(wrapper.find('#incidents-ip-search').exists()).toBe(true)
  })

  it('TimelineView filter controls have id for label association', () => {
    const wrapper = mount(TimelineView, {
      props: { timelineEvents: [] }
    })
    expect(wrapper.find('#timeline-severity-filter').exists()).toBe(true)
    expect(wrapper.find('#timeline-ip-search').exists()).toBe(true)
  })
})

describe('UX regression: Responsive class containers', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('InvestigationEntities has bounded table with data-testid', () => {
    const wrapper = mount(InvestigationEntities, {
      props: {
        analysisResult: {
          timeline_events: [{
            event_id: 'evt-1',
            timestamp: '2026-06-09T10:00:00Z',
            source_ip: '203.0.113.10',
            title: 'POST /admin/login',
            description: 'login attempt',
            evidence: 'POST /admin/login HTTP/1.1" 401',
            source_file: 'access.log'
          }],
          source_files: [{ filename: 'access.log' }]
        }
      }
    })
    const tablePanel = wrapper.find('[data-testid="entities-table-panel"]')
    expect(tablePanel.exists()).toBe(true)
    expect(tablePanel.classes()).toContain('entities-table')
  })

  it('FindingsList empty state has data-testid accessible structure', () => {
    const wrapper = mount(FindingsList, {
      props: { findings: [] }
    })
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.text()).toContain('No risks detected')
  })
})

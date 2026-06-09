import { describe, expect, it, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import InvestigationEntities from '../components/InvestigationEntities.vue'
import { setLanguage } from '../i18n'

describe('InvestigationEntities.vue', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('renders extracted investigation entities and related metadata', () => {
    const wrapper = mount(InvestigationEntities, {
      props: {
        analysisResult: {
          timeline_events: [
            {
              event_id: 'evt-1',
              timestamp: '2026-06-09T10:00:00Z',
              source_ip: '203.0.113.10',
              title: 'POST /admin/login',
              description: 'user=alice status=401',
              evidence: 'POST /admin/login HTTP/1.1" 401',
              source_file: 'batch-a.log'
            }
          ],
          source_files: [{ filename: 'batch-a.log' }]
        }
      }
    })

    expect(wrapper.text()).toContain('Investigation Entities (6)')
    expect(wrapper.text()).toContain('IP Address')
    expect(wrapper.text()).toContain('203.0.113.10')
    expect(wrapper.text()).toContain('alice')
    expect(wrapper.text()).toContain('POST')
    expect(wrapper.text()).toContain('401')
    expect(wrapper.text()).toContain('batch-a.log')
  })

  it('shows a not available fallback when no entities can be extracted', () => {
    const wrapper = mount(InvestigationEntities, {
      props: {
        analysisResult: {
          findings: [],
          incidents: [],
          timeline_events: []
        }
      }
    })

    expect(wrapper.text()).toContain('Not available')
  })
})

import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { setLanguage } from '../i18n'
import CaseClosureNextActions from '../components/CaseClosureNextActions.vue'

function mountNextActions(props = {}) {
  return mount(CaseClosureNextActions, {
    props
  })
}

describe('CaseClosureNextActions.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setLanguage('en')
  })

  it('builds deduplicated next actions in priority order and limits the list to five', () => {
    const wrapper = mountNextActions({
      gapItems: [
        { id: 'missing-findings' },
        { id: 'missing-incidents' },
        { id: 'missing-notes' },
        { id: 'empty-timeline' },
        { id: 'review-readiness-attention' },
        { id: 'guardrails-attention' },
        { id: 'share-safety-attention' },
        { id: 'quality-needs-improvement' }
      ],
      handoffReadiness: {
        id: 'handoff-readiness',
        value: 'Needs review',
        description: 'Review is still recommended.',
        tone: 'warning'
      }
    })

    const actionTitles = wrapper.findAll('.action-item h5').map((node) => node.text())

    expect(actionTitles).toEqual([
      'Add case notes',
      'Review incidents / findings',
      'Review timeline',
      'Address review readiness warnings',
      'Resolve export guardrails'
    ])
    expect(wrapper.find('[data-testid="case-closure-next-action-review-share-safety-items"]').exists()).toBe(false)
    expect(wrapper.find('[data-testid="case-closure-next-action-prepare-final-handoff"]').exists()).toBe(false)
  })

  it('does not show prepare final handoff when gaps still exist', () => {
    const wrapper = mountNextActions({
      gapItems: [
        { id: 'missing-notes' }
      ],
      handoffReadiness: {
        id: 'handoff-readiness',
        value: 'Ready',
        description: 'Ready for handoff.',
        tone: 'positive'
      }
    })

    expect(wrapper.find('[data-testid="case-closure-next-action-add-case-notes"]').exists()).toBe(true)
    expect(wrapper.find('[data-testid="case-closure-next-action-prepare-final-handoff"]').exists()).toBe(false)
  })

  it('shows prepare final handoff when no gaps remain and handoff is ready', () => {
    const wrapper = mountNextActions({
      gapItems: [],
      handoffReadiness: {
        id: 'handoff-readiness',
        value: 'Ready',
        description: 'Ready for handoff.',
        tone: 'positive'
      }
    })

    expect(wrapper.get('[data-testid="case-closure-next-action-prepare-final-handoff"]').text()).toContain('Prepare final handoff')
    expect(wrapper.findAll('.action-item')).toHaveLength(1)
  })
})

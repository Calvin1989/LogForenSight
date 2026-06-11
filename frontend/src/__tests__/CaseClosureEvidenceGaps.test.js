import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { setLanguage } from '../i18n'
import CaseClosureEvidenceGaps from '../components/CaseClosureEvidenceGaps.vue'

function mountEvidenceGaps(props = {}) {
  return mount(CaseClosureEvidenceGaps, {
    props
  })
}

describe('CaseClosureEvidenceGaps.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setLanguage('en')
  })

  it('lists multiple gap items when checklist signals need attention', () => {
    const wrapper = mountEvidenceGaps({
      gapItems: [
        { id: 'missing-notes', label: 'Missing case notes', value: 'Missing', description: 'No case notes are recorded yet.', tone: 'warning' },
        { id: 'empty-timeline', label: 'Timeline unavailable or empty', value: 'Unavailable', description: 'Timeline data is unavailable.', tone: 'neutral' },
        { id: 'rule-coverage-unavailable', label: 'Rule coverage unavailable', value: 'Unavailable', description: 'Rule coverage data is unavailable.', tone: 'neutral' },
        { id: 'review-readiness-attention', label: 'Review readiness needs attention', value: 'Attention needed', description: '2 blocking checks remain.', tone: 'warning' },
        { id: 'quality-needs-improvement', label: 'Quality score needs improvement', value: '45 / 100', description: 'Partial', tone: 'warning' },
        { id: 'guardrails-attention', label: 'Export guardrails need attention', value: 'Review recommended', description: 'Guardrails need analyst review.', tone: 'warning' },
        { id: 'share-safety-attention', label: 'Share safety review has items', value: 'Attention', description: 'Review suggested for 2 risk indicators', tone: 'danger' },
        { id: 'handoff-needs-review', label: 'Handoff readiness not ready', value: 'Needs review', description: 'At least one review, quality, or share safety signal still needs analyst review.', tone: 'warning' }
      ]
    })

    expect(wrapper.text()).toContain('Evidence gaps')
    expect(wrapper.get('[data-testid="case-closure-gap-missing-notes"]').text()).toContain('Missing case notes')
    expect(wrapper.get('[data-testid="case-closure-gap-empty-timeline"]').text()).toContain('Timeline unavailable or empty')
    expect(wrapper.get('[data-testid="case-closure-gap-rule-coverage-unavailable"]').text()).toContain('Rule coverage unavailable')
    expect(wrapper.get('[data-testid="case-closure-gap-review-readiness-attention"]').text()).toContain('Review readiness needs attention')
    expect(wrapper.get('[data-testid="case-closure-gap-quality-needs-improvement"]').text()).toContain('Quality score needs improvement')
    expect(wrapper.get('[data-testid="case-closure-gap-guardrails-attention"]').text()).toContain('Export guardrails need attention')
    expect(wrapper.get('[data-testid="case-closure-gap-share-safety-attention"]').text()).toContain('Share safety review has items')
    expect(wrapper.get('[data-testid="case-closure-gap-handoff-needs-review"]').text()).toContain('Handoff readiness not ready')
  })

  it('shows no gaps when all closure signals are healthy', () => {
    const wrapper = mountEvidenceGaps({
      gapItems: []
    })

    expect(wrapper.text()).toContain('No obvious closure gaps were detected.')
    expect(wrapper.findAll('.gap-item')).toHaveLength(0)
  })

  it('includes rule coverage unavailable as a neutral but closure-impacting gap', () => {
    const wrapper = mountEvidenceGaps({
      gapItems: [
        { id: 'rule-coverage-unavailable', label: 'Rule coverage unavailable', value: 'Unavailable', description: 'Rule coverage data is unavailable.', tone: 'neutral' }
      ]
    })

    expect(wrapper.get('[data-testid="case-closure-gap-rule-coverage-unavailable"]').text()).toContain('Rule coverage unavailable')
  })

  it('shows share safety gaps only when review items exist', () => {
    const safeWrapper = mountEvidenceGaps({
      gapItems: []
    })
    expect(safeWrapper.find('[data-testid="case-closure-gap-share-safety-attention"]').exists()).toBe(false)

    const warningWrapper = mountEvidenceGaps({
      gapItems: [
        { id: 'share-safety-attention', label: 'Share safety review has items', value: 'Review recommended', description: 'Review suggested for 1 risk indicators', tone: 'warning' }
      ]
    })
    expect(warningWrapper.get('[data-testid="case-closure-gap-share-safety-attention"]').text()).toContain('Share safety review has items')
  })

  it('shows handoff gap only when readiness is not ready', () => {
    const readyWrapper = mountEvidenceGaps({
      gapItems: []
    })
    expect(readyWrapper.find('[data-testid="case-closure-gap-handoff-needs-review"]').exists()).toBe(false)

    const reviewWrapper = mountEvidenceGaps({
      gapItems: [
        { id: 'handoff-needs-review', label: 'Handoff readiness not ready', value: 'Needs review', description: 'Analyst review is still recommended.', tone: 'warning' }
      ]
    })
    expect(reviewWrapper.get('[data-testid="case-closure-gap-handoff-needs-review"]').text()).toContain('Handoff readiness not ready')
  })
})

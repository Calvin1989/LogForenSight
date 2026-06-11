import { beforeEach, describe, expect, it } from 'vitest'
import { setLanguage } from '../i18n'
import { buildCaseClosureGapItems } from '../utils/caseClosureGapItems'

describe('caseClosureGapItems', () => {
  beforeEach(() => {
    localStorage.clear()
    setLanguage('en')
  })

  it('builds gap items from checklist attention signals', () => {
    const gapItems = buildCaseClosureGapItems({
      checklistItems: [
        { id: 'case-notes', value: 'Missing', description: 'No case notes are recorded yet.', tone: 'warning' },
        { id: 'timeline', value: 'Unavailable', description: 'Timeline data is unavailable.', tone: 'neutral' },
        { id: 'incidents', value: 'Missing', description: 'No incidents are available.', tone: 'warning' },
        { id: 'findings', value: 'Available', description: '1 finding is available.', tone: 'positive' },
        { id: 'rule-coverage', value: 'Unavailable', description: 'Rule coverage data is unavailable.', tone: 'neutral' },
        { id: 'review-readiness', value: 'Attention needed', description: '2 blockers remain.', tone: 'warning' },
        { id: 'quality-score', value: '45 / 100', description: 'Partial', tone: 'warning' },
        { id: 'export-guardrails', value: 'Review recommended', description: 'Guardrails need review.', tone: 'warning' },
        { id: 'share-safety', value: 'Attention', description: 'Review suggested for 2 risk indicators.', tone: 'danger' }
      ],
      handoffReadiness: {
        id: 'handoff-readiness',
        value: 'Needs review',
        description: 'At least one review signal still needs attention.',
        tone: 'warning'
      }
    })

    expect(gapItems.map((item) => item.id)).toEqual([
      'missing-notes',
      'empty-timeline',
      'missing-incidents',
      'rule-coverage-unavailable',
      'review-readiness-attention',
      'quality-needs-improvement',
      'guardrails-attention',
      'share-safety-attention',
      'handoff-needs-review'
    ])
    expect(gapItems[0].label).toBe('Missing case notes')
    expect(gapItems[4].label).toBe('Review readiness needs attention')
  })

  it('falls back to a handoff gap when readiness is unavailable', () => {
    const gapItems = buildCaseClosureGapItems({
      checklistItems: [],
      handoffReadiness: {
        id: 'handoff-readiness',
        value: 'Unavailable',
        description: 'Not enough handoff signals are available to determine readiness.',
        tone: 'neutral'
      }
    })

    expect(gapItems).toHaveLength(1)
    expect(gapItems[0].id).toBe('handoff-needs-review')
    expect(gapItems[0].label).toBe('Handoff readiness not ready')
  })
})

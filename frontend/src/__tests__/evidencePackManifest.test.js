import { beforeEach, describe, expect, it } from 'vitest'
import { setLanguage } from '../i18n'
import { buildEvidencePackManifest } from '../utils/evidencePackManifest'

describe('evidencePackManifest', () => {
  beforeEach(() => {
    localStorage.clear()
    setLanguage('en')
  })

  it('builds a stable manifest object from complete input', () => {
    const manifest = buildEvidencePackManifest({
      result: {
        findings: [{ id: 'f-1' }, { id: 'f-2' }],
        incidents: [{ id: 'i-1' }],
        timeline_events: [{ id: 't-1' }],
        rule_coverage: [{ id: 'r-1' }, { id: 'r-2' }, { id: 'r-3' }],
        parse_stats: {
          source_files: [{ filename: 'a.log' }, { filename: 'b.log' }]
        },
        summary: {},
        executive_summary: {}
      },
      triageState: {
        'finding:f-1': { status: 'investigating' },
        'finding:f-2': { status: 'reviewed' },
        'incident:i-1': { status: 'mitigated' }
      },
      caseNotes: [{ id: 'n-1' }, { id: 'n-2' }],
      reviewReadiness: { status: 'ready', summary: { requiredBlockers: 0 } },
      evidencePackQuality: { score: 88, status: 'good', summary: { maxScore: 100 } },
      exportGuardrails: { decision: 'review_recommended' },
      shareSafety: { status: 'review_recommended' }
    }, {
      generatedAt: '2026-06-11T12:34:56.000Z'
    })

    expect(manifest).toEqual({
      generatedAt: '2026-06-11T12:34:56.000Z',
      sourceCounts: {
        findings: 2,
        incidents: 1,
        timelineEvents: 1,
        ruleCoverage: 3,
        sourceFiles: 2,
        triageRecords: 3,
        caseNotes: 2,
        entities: 0
      },
      statusSummary: {
        reviewReadinessStatus: 'ready',
        qualityScore: 88,
        qualityStatus: 'good',
        guardrailDecision: 'review_recommended',
        shareSafetyStatus: 'review_recommended',
        handoffReadinessStatus: 'needs_review'
      },
      closureSummary: {
        gapCount: 3,
        nextActionCount: 2
      }
    })
  })

  it('falls back safely when optional input is missing', () => {
    const manifest = buildEvidencePackManifest({
      result: {
        findings: [],
        incidents: [],
        timeline_events: [],
        rule_coverage: [],
        parse_stats: {}
      }
    }, {
      generatedAt: '2026-06-11T00:00:00.000Z'
    })

    expect(manifest.generatedAt).toBe('2026-06-11T00:00:00.000Z')
    expect(manifest.sourceCounts).toEqual({
      findings: 0,
      incidents: 0,
      timelineEvents: 0,
      ruleCoverage: 0,
      sourceFiles: 0,
      triageRecords: 0,
      caseNotes: 0,
      entities: 0
    })
    expect(manifest.statusSummary).toEqual({
      reviewReadinessStatus: 'unavailable',
      qualityScore: null,
      qualityStatus: 'unavailable',
      guardrailDecision: 'unavailable',
      shareSafetyStatus: 'unavailable',
      handoffReadinessStatus: 'unavailable'
    })
    expect(manifest.closureSummary.gapCount).toBeGreaterThanOrEqual(0)
    expect(manifest.closureSummary.nextActionCount).toBeGreaterThanOrEqual(0)
  })
})

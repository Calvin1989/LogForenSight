import { describe, expect, it } from 'vitest'
import { buildEvidencePackQuality } from '../utils/evidencePackQuality'

function getCheck(quality, id) {
  return quality.checks.find((check) => check.id === id)
}

describe('evidencePackQuality', () => {
  it('returns score 0 and missing status for empty input', () => {
    const quality = buildEvidencePackQuality()

    expect(quality.score).toBe(0)
    expect(quality.status).toBe('missing')
    expect(quality.summary).toMatchObject({
      maxScore: 100,
      earnedScore: 0,
      totalChecks: 5,
      passedChecks: 0
    })
  })

  it('passes the high-risk check when no high-risk findings exist', () => {
    const quality = buildEvidencePackQuality({
      result: {
        findings: [{ rule_id: 'rule-1', severity: 'medium' }],
        incidents: []
      },
      triageState: {},
      caseNotes: []
    })

    expect(getCheck(quality, 'highRiskReviewed')).toMatchObject({
      status: 'pass',
      earned: 25
    })
  })

  it('loses 25 points when a high-risk finding is unreviewed', () => {
    const quality = buildEvidencePackQuality({
      result: {
        findings: [{ rule_id: 'rule-1', severity: 'high', metadata: { source_ip: '1.2.3.4' } }],
        incidents: [],
        summary: {
          top_ips: [{ ip: '1.2.3.4', count: 1 }]
        }
      },
      triageState: {},
      caseNotes: [{ id: 'note-1', body: 'Captured analyst note.' }],
      reviewReadiness: { status: 'ready' }
    })

    expect(quality.score).toBe(75)
    expect(getCheck(quality, 'highRiskReviewed')).toMatchObject({
      status: 'missing',
      earned: 0
    })
  })

  it('passes the incident check when incidents are triaged', () => {
    const quality = buildEvidencePackQuality({
      result: {
        findings: [],
        incidents: [{ incident_id: 'inc-1', title: 'Incident 1' }]
      },
      triageState: {
        'incident:inc-1': { status: 'open' }
      }
    })

    expect(getCheck(quality, 'incidentsTriaged')).toMatchObject({
      status: 'pass',
      earned: 20
    })
  })

  it('loses 20 points when case notes are missing', () => {
    const quality = buildEvidencePackQuality({
      result: {
        findings: [],
        incidents: []
      },
      caseNotes: []
    })

    expect(getCheck(quality, 'caseNotesPresent')).toMatchObject({
      status: 'missing',
      earned: 0
    })
  })

  it('earns 15 points when investigation entities are present', () => {
    const quality = buildEvidencePackQuality({
      result: {
        findings: [],
        incidents: [],
        summary: {
          top_ips: [{ ip: '1.2.3.4', count: 1 }]
        }
      }
    })

    expect(getCheck(quality, 'entitiesPresent')).toMatchObject({
      status: 'pass',
      earned: 15
    })
  })

  it('earns 20 points when review readiness is ready', () => {
    const quality = buildEvidencePackQuality({
      result: {
        findings: [],
        incidents: []
      },
      reviewReadiness: { status: 'ready' }
    })

    expect(getCheck(quality, 'reviewReadinessReady')).toMatchObject({
      status: 'pass',
      earned: 20
    })
  })

  it('maps score thresholds to missing, partial, good, and ready', () => {
    const missing = buildEvidencePackQuality({
      result: {
        findings: [{ rule_id: 'rule-1', severity: 'high' }],
        incidents: [{ incident_id: 'inc-1', title: 'Incident 1' }]
      },
      triageState: {},
      caseNotes: [],
      reviewReadiness: null
    })

    const partial = buildEvidencePackQuality({
      result: {
        findings: [],
        incidents: []
      },
      caseNotes: [{ id: 'note-1', body: 'Analyst note' }]
    })

    const good = buildEvidencePackQuality({
      result: {
        findings: [],
        incidents: [],
        summary: {
          top_ips: [{ ip: '1.2.3.4', count: 1 }]
        }
      },
      caseNotes: [{ id: 'note-1', body: 'Analyst note' }]
    })

    const ready = buildEvidencePackQuality({
      result: {
        findings: [],
        incidents: [],
        summary: {
          top_ips: [{ ip: '1.2.3.4', count: 1 }]
        }
      },
      caseNotes: [{ id: 'note-1', body: 'Analyst note' }],
      reviewReadiness: { status: 'ready' }
    })

    expect(missing.score).toBe(0)
    expect(missing.status).toBe('missing')
    expect(partial.score).toBe(65)
    expect(partial.status).toBe('partial')
    expect(good.score).toBe(80)
    expect(good.status).toBe('good')
    expect(ready.score).toBe(100)
    expect(ready.status).toBe('ready')
  })
})

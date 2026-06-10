import { describe, expect, it } from 'vitest'
import { buildReviewReadiness } from '../utils/reviewReadiness'

function buildResult(overrides = {}) {
  return {
    findings: [],
    incidents: [],
    summary: {},
    ...overrides
  }
}

describe('reviewReadiness', () => {
  it('handles empty result fallback without throwing', () => {
    const readiness = buildReviewReadiness({
      result: null,
      triageState: undefined,
      caseNotes: undefined
    })

    expect(readiness.status).toBe('attention')
    expect(readiness.summary.totalChecks).toBe(5)
    expect(readiness.summary.highRiskFindings.total).toBe(0)
    expect(readiness.summary.incidents.total).toBe(0)
    expect(readiness.summary.caseNotesCount).toBe(0)
  })

  it('marks high and critical findings without triage as attention', () => {
    const readiness = buildReviewReadiness({
      result: buildResult({
        findings: [
          { rule_id: 'rule-1', severity: 'high' },
          { rule_id: 'rule-2', severity: 'critical' }
        ]
      }),
      triageState: {},
      caseNotes: [{ id: 'note-1' }]
    })

    const highRiskCheck = readiness.checks.find((check) => check.id === 'highRiskFindings')
    expect(highRiskCheck.status).toBe('attention')
    expect(highRiskCheck.count).toBe(2)
  })

  it('marks reviewed high-risk findings as ready', () => {
    const readiness = buildReviewReadiness({
      result: buildResult({
        findings: [
          { rule_id: 'rule-1', severity: 'high' },
          { rule_id: 'rule-2', severity: 'critical' }
        ]
      }),
      triageState: {
        'finding:rule-1': { status: 'investigating' },
        'finding:rule-2': { status: 'mitigated' }
      },
      caseNotes: [{ id: 'note-1' }]
    })

    const highRiskCheck = readiness.checks.find((check) => check.id === 'highRiskFindings')
    expect(highRiskCheck.status).toBe('ready')
    expect(highRiskCheck.count).toBe(0)
    expect(highRiskCheck.readyCount).toBe(2)
  })

  it('marks incidents with missing triage as attention', () => {
    const readiness = buildReviewReadiness({
      result: buildResult({
        incidents: [
          { incident_id: 'inc-1', title: 'Incident 1' },
          { incident_id: 'inc-2', title: 'Incident 2' }
        ]
      }),
      triageState: {
        'incident:inc-1': { status: 'mitigated' }
      },
      caseNotes: [{ id: 'note-1' }]
    })

    const incidentsCheck = readiness.checks.find((check) => check.id === 'incidents')
    expect(incidentsCheck.status).toBe('attention')
    expect(incidentsCheck.count).toBe(1)
  })

  it('marks case notes as ready when notes exist', () => {
    const readiness = buildReviewReadiness({
      result: buildResult(),
      triageState: {},
      caseNotes: [{ id: 'note-1' }, { id: 'note-2' }]
    })

    const caseNotesCheck = readiness.checks.find((check) => check.id === 'caseNotes')
    expect(caseNotesCheck.status).toBe('ready')
    expect(caseNotesCheck.count).toBe(2)
  })

  it('marks case notes as missing when no notes exist', () => {
    const readiness = buildReviewReadiness({
      result: buildResult(),
      triageState: {},
      caseNotes: []
    })

    const caseNotesCheck = readiness.checks.find((check) => check.id === 'caseNotes')
    expect(caseNotesCheck.status).toBe('missing')
    expect(caseNotesCheck.count).toBe(0)
  })

  it('becomes overall ready only when required checks pass', () => {
    const readyReadiness = buildReviewReadiness({
      result: buildResult({
        findings: [{ rule_id: 'rule-1', severity: 'high', evidence: ['GET /login'] }],
        incidents: [{ incident_id: 'inc-1', title: 'Incident 1' }]
      }),
      triageState: {
        'finding:rule-1': { status: 'investigating' },
        'incident:inc-1': { status: 'mitigated' }
      },
      caseNotes: [{ id: 'note-1', body: 'Escalated for review.' }]
    })

    const notReadyReadiness = buildReviewReadiness({
      result: buildResult({
        findings: [{ rule_id: 'rule-1', severity: 'high' }],
        incidents: [{ incident_id: 'inc-1', title: 'Incident 1' }]
      }),
      triageState: {
        'finding:rule-1': { status: 'open' }
      },
      caseNotes: []
    })

    expect(readyReadiness.status).toBe('ready')
    expect(readyReadiness.checks.find((check) => check.id === 'evidencePack').status).toBe('ready')
    expect(notReadyReadiness.status).toBe('attention')
    expect(notReadyReadiness.checks.find((check) => check.id === 'evidencePack').status).toBe('attention')
  })
})

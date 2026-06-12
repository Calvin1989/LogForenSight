import { beforeEach, describe, expect, it } from 'vitest'
import { setLanguage } from '../i18n'
import {
  buildEvidencePackManifestAuditTrail,
  buildEvidencePackManifest,
  getEvidencePackManifestExportFields,
  validateEvidencePackManifestForExport,
  MANIFEST_EXPORT_FIELD_ALLOWLIST,
  MANIFEST_FIELD_RISK_LEVELS
} from '../utils/evidencePackManifest'

function countAllowlistFields() {
  return Object.values(MANIFEST_EXPORT_FIELD_ALLOWLIST).reduce((count, value) => {
    if (value === true) {
      return count + 1
    }

    if (Array.isArray(value)) {
      return count + value.length
    }

    return count
  }, 0)
}

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

  it('returns only allowlisted low-risk fields for future export', () => {
    const manifest = {
      generatedAt: '2026-06-11T12:34:56.000Z',
      sourceCounts: {
        findings: 2,
        incidents: 1,
        timelineEvents: 1,
        ruleCoverage: 3,
        sourceFiles: 2,
        triageRecords: 3,
        caseNotes: 2,
        entities: 4,
        sourceFileNames: ['a.log', 'b.log']
      },
      statusSummary: {
        reviewReadinessStatus: 'ready',
        qualityScore: 88,
        qualityStatus: 'good',
        guardrailDecision: 'review_recommended',
        shareSafetyStatus: 'safe',
        handoffReadinessStatus: 'needs_review',
        rawFindingDescriptions: ['Credential stuffing detected']
      },
      closureSummary: {
        gapCount: 3,
        nextActionCount: 2,
        rawIncidentText: ['Incident summary']
      },
      sourceFileNames: ['access.log'],
      urls: ['https://portal.example.com/login?user=alice']
    }

    expect(MANIFEST_EXPORT_FIELD_ALLOWLIST).toEqual({
      generatedAt: true,
      sourceCounts: [
        'findings',
        'incidents',
        'timelineEvents',
        'ruleCoverage',
        'sourceFiles',
        'triageRecords',
        'caseNotes',
        'entities'
      ],
      statusSummary: [
        'reviewReadinessStatus',
        'qualityScore',
        'qualityStatus',
        'guardrailDecision',
        'shareSafetyStatus',
        'handoffReadinessStatus'
      ],
      closureSummary: [
        'gapCount',
        'nextActionCount'
      ]
    })

    expect(getEvidencePackManifestExportFields(manifest)).toEqual({
      generatedAt: '2026-06-11T12:34:56.000Z',
      sourceCounts: {
        findings: 2,
        incidents: 1,
        timelineEvents: 1,
        ruleCoverage: 3,
        sourceFiles: 2,
        triageRecords: 3,
        caseNotes: 2,
        entities: 4
      },
      statusSummary: {
        reviewReadinessStatus: 'ready',
        qualityScore: 88,
        qualityStatus: 'good',
        guardrailDecision: 'review_recommended',
        shareSafetyStatus: 'safe',
        handoffReadinessStatus: 'needs_review'
      },
      closureSummary: {
        gapCount: 3,
        nextActionCount: 2
      }
    })
  })

  it('marks prohibited manifest field types as high risk', () => {
    expect(MANIFEST_FIELD_RISK_LEVELS.generatedAt).toBe('low')
    expect(MANIFEST_FIELD_RISK_LEVELS['sourceCounts.findings']).toBe('low')
    expect(MANIFEST_FIELD_RISK_LEVELS['statusSummary.qualityScore']).toBe('low')
    expect(MANIFEST_FIELD_RISK_LEVELS.sourceFileNames).toBe('high')
    expect(MANIFEST_FIELD_RISK_LEVELS.rawPaths).toBe('high')
    expect(MANIFEST_FIELD_RISK_LEVELS.urls).toBe('high')
    expect(MANIFEST_FIELD_RISK_LEVELS.accountLikeValues).toBe('high')
    expect(MANIFEST_FIELD_RISK_LEVELS.rawEvidenceSnippets).toBe('high')
    expect(MANIFEST_FIELD_RISK_LEVELS.freeFormCaseNoteContent).toBe('high')
    expect(MANIFEST_FIELD_RISK_LEVELS.rawFindingDescriptions).toBe('high')
    expect(MANIFEST_FIELD_RISK_LEVELS.rawIncidentText).toBe('high')
  })

  it('validates a standard manifest as safe and compatible for future export', () => {
    const manifest = buildEvidencePackManifest({
      result: {
        findings: [{ id: 'f-1' }],
        incidents: [{ id: 'i-1' }],
        timeline_events: [],
        rule_coverage: [{ id: 'r-1' }],
        parse_stats: {
          source_files: [{ filename: 'a.log' }]
        }
      },
      triageState: {
        'finding:f-1': { status: 'investigating' }
      },
      caseNotes: [{ id: 'n-1' }],
      reviewReadiness: { status: 'ready' },
      evidencePackQuality: { score: 92, status: 'good' },
      exportGuardrails: { decision: 'ready' },
      shareSafety: { status: 'safe' }
    }, {
      generatedAt: '2026-06-11T12:34:56.000Z'
    })

    expect(validateEvidencePackManifestForExport(manifest)).toEqual({
      status: 'compatible',
      compatibility: 'safe',
      compatible: true,
      exportFieldCount: countAllowlistFields(),
      exportFields: {
        generatedAt: '2026-06-11T12:34:56.000Z',
        sourceCounts: {
          findings: 1,
          incidents: 1,
          timelineEvents: 0,
          ruleCoverage: 1,
          sourceFiles: 1,
          triageRecords: 1,
          caseNotes: 1,
          entities: 0
        },
        statusSummary: {
          reviewReadinessStatus: 'ready',
          qualityScore: 92,
          qualityStatus: 'good',
          guardrailDecision: 'ready',
          shareSafetyStatus: 'safe',
          handoffReadinessStatus: 'ready'
        },
        closureSummary: {
          gapCount: 1,
          nextActionCount: 1
        }
      },
      blockedFields: [],
      warnings: []
    })
  })

  it('blocks export validation when high-risk manifest extension fields are present', () => {
    const manifest = {
      generatedAt: '2026-06-11T12:34:56.000Z',
      sourceCounts: {
        findings: 1,
        incidents: 1,
        timelineEvents: 0,
        ruleCoverage: 1,
        sourceFiles: 1,
        triageRecords: 1,
        caseNotes: 1,
        entities: 0
      },
      statusSummary: {
        reviewReadinessStatus: 'ready',
        qualityScore: 92,
        qualityStatus: 'good',
        guardrailDecision: 'ready',
        shareSafetyStatus: 'safe',
        handoffReadinessStatus: 'ready'
      },
      closureSummary: {
        gapCount: 0,
        nextActionCount: 0
      },
      sourceFileNames: ['access.log'],
      extension: {
        urls: ['https://portal.example.com/login?user=alice'],
        rawFindingDescriptions: ['Credential stuffing detected'],
        rawIncidentText: ['Suspicious incident body']
      }
    }

    const validation = validateEvidencePackManifestForExport(manifest)

    expect(validation.status).toBe('blocked')
    expect(validation.compatibility).toBe('unsafe')
    expect(validation.compatible).toBe(false)
    expect(validation.exportFieldCount).toBe(countAllowlistFields())
    expect(validation.exportFields.generatedAt).toBe('2026-06-11T12:34:56.000Z')
    expect(validation.exportFields.sourceCounts.sourceFiles).toBe(1)
    expect(validation.exportFields.statusSummary.qualityScore).toBe(92)
    expect(validation.exportFields.closureSummary.nextActionCount).toBe(0)
    expect(validation.blockedFields).toEqual(expect.arrayContaining([
      expect.objectContaining({ fieldType: 'sourceFileNames', riskLevel: 'high' }),
      expect.objectContaining({ fieldType: 'urls', riskLevel: 'high' }),
      expect.objectContaining({ fieldType: 'rawFindingDescriptions', riskLevel: 'high' }),
      expect.objectContaining({ fieldType: 'rawIncidentText', riskLevel: 'high' })
    ]))
    expect(validation.warnings).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'blocked-manifest-field', fieldType: 'sourceFileNames' }),
      expect.objectContaining({ code: 'blocked-manifest-field', fieldType: 'urls' })
    ]))
  })

  it('builds a stable audit trail from a compatible manifest and reuses manifest generatedAt', () => {
    const manifest = buildEvidencePackManifest({
      result: {
        findings: [{ id: 'f-1' }],
        incidents: [{ id: 'i-1' }],
        timeline_events: [],
        rule_coverage: [{ id: 'r-1' }],
        parse_stats: {
          source_files: [{ filename: 'a.log' }]
        }
      },
      triageState: {
        'finding:f-1': { status: 'investigating' }
      },
      caseNotes: [{ id: 'n-1' }],
      reviewReadiness: { status: 'ready' },
      evidencePackQuality: { score: 92, status: 'good' },
      exportGuardrails: { decision: 'ready' },
      shareSafety: { status: 'safe' }
    }, {
      generatedAt: '2026-06-11T12:34:56.000Z'
    })

    expect(buildEvidencePackManifestAuditTrail(manifest, {
      shareSafetyStatus: 'safe'
    })).toEqual({
      generatedAt: '2026-06-11T12:34:56.000Z',
      manifestSourceType: 'preview_derived',
      manifestCompatibilityStatus: 'compatible',
      exportFieldAllowlistCount: countAllowlistFields(),
      blockedHighRiskFieldCategoriesCount: 0,
      markdownExportStatus: 'unchanged',
      shareSafetyStatus: 'safe',
      previewDistributionSurfacesStatus: 'unchanged'
    })
  })

  it('builds an audit trail with deduplicated blocked field categories for blocked manifests', () => {
    const manifest = {
      generatedAt: '2026-06-11T12:34:56.000Z',
      sourceCounts: {
        findings: 1,
        incidents: 1,
        timelineEvents: 0,
        ruleCoverage: 1,
        sourceFiles: 1,
        triageRecords: 1,
        caseNotes: 1,
        entities: 0
      },
      statusSummary: {
        reviewReadinessStatus: 'ready',
        qualityScore: 92,
        qualityStatus: 'good',
        guardrailDecision: 'ready',
        shareSafetyStatus: 'review_recommended',
        handoffReadinessStatus: 'ready'
      },
      closureSummary: {
        gapCount: 0,
        nextActionCount: 0
      },
      sourceFileNames: ['access.log'],
      extension: {
        urls: ['https://portal.example.com/login?user=alice'],
        nested: {
          urls: ['https://portal.example.com/reset?token=abc'],
          rawFindingDescriptions: ['Credential stuffing detected']
        }
      }
    }

    expect(buildEvidencePackManifestAuditTrail(manifest, {
      shareSafetyStatus: 'review_recommended'
    })).toEqual({
      generatedAt: '2026-06-11T12:34:56.000Z',
      manifestSourceType: 'preview_derived',
      manifestCompatibilityStatus: 'blocked',
      exportFieldAllowlistCount: countAllowlistFields(),
      blockedHighRiskFieldCategoriesCount: 3,
      markdownExportStatus: 'unchanged',
      shareSafetyStatus: 'review_recommended',
      previewDistributionSurfacesStatus: 'unchanged'
    })
  })
})

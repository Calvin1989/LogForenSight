import { t } from '../i18n'

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function findItem(items, id) {
  return normalizeArray(items).find((item) => item?.id === id) || null
}

function createGap(id, labelKey, source) {
  return {
    id,
    label: t(labelKey),
    value: source?.value || t('caseClosureChecklist.statusUnavailable'),
    description: source?.description || t('caseClosureChecklist.handoffUnavailableDetail'),
    tone: source?.tone || 'neutral'
  }
}

function hasAttentionTone(item) {
  return item?.tone === 'warning' || item?.tone === 'danger'
}

function shouldIncludeTimeline(item) {
  return item?.id === 'timeline' && item?.tone !== 'positive'
}

function shouldIncludeRuleCoverage(item) {
  return item?.id === 'rule-coverage' && item?.tone !== 'positive'
}

function shouldIncludeHandoff(item) {
  return Boolean(item) && item.tone !== 'positive'
}

export function buildCaseClosureGapItems({ checklistItems = [], handoffReadiness = null } = {}) {
  const gaps = []
  const findings = findItem(checklistItems, 'findings')
  const incidents = findItem(checklistItems, 'incidents')
  const timeline = findItem(checklistItems, 'timeline')
  const ruleCoverage = findItem(checklistItems, 'rule-coverage')
  const caseNotes = findItem(checklistItems, 'case-notes')
  const reviewReadiness = findItem(checklistItems, 'review-readiness')
  const qualityScore = findItem(checklistItems, 'quality-score')
  const exportGuardrails = findItem(checklistItems, 'export-guardrails')
  const shareSafety = findItem(checklistItems, 'share-safety')
  const handoff = handoffReadiness && typeof handoffReadiness === 'object'
    ? handoffReadiness
    : findItem(checklistItems, 'handoff-readiness')

  if (hasAttentionTone(caseNotes)) {
    gaps.push(createGap('missing-notes', 'caseClosureChecklist.gapMissingNotes', caseNotes))
  }

  if (shouldIncludeTimeline(timeline)) {
    gaps.push(createGap('empty-timeline', 'caseClosureChecklist.gapEmptyTimeline', timeline))
  }

  if (hasAttentionTone(incidents)) {
    gaps.push(createGap('missing-incidents', 'caseClosureChecklist.gapMissingIncidents', incidents))
  }

  if (hasAttentionTone(findings)) {
    gaps.push(createGap('missing-findings', 'caseClosureChecklist.gapMissingFindings', findings))
  }

  if (shouldIncludeRuleCoverage(ruleCoverage)) {
    gaps.push(createGap('rule-coverage-unavailable', 'caseClosureChecklist.gapRuleCoverageUnavailable', ruleCoverage))
  }

  if (hasAttentionTone(reviewReadiness)) {
    gaps.push(createGap('review-readiness-attention', 'caseClosureChecklist.gapReviewReadinessAttention', reviewReadiness))
  }

  if (hasAttentionTone(qualityScore)) {
    gaps.push(createGap('quality-needs-improvement', 'caseClosureChecklist.gapQualityNeedsImprovement', qualityScore))
  }

  if (hasAttentionTone(exportGuardrails)) {
    gaps.push(createGap('guardrails-attention', 'caseClosureChecklist.gapGuardrailsAttention', exportGuardrails))
  }

  if (hasAttentionTone(shareSafety)) {
    gaps.push(createGap('share-safety-attention', 'caseClosureChecklist.gapShareSafetyAttention', shareSafety))
  }

  if (shouldIncludeHandoff(handoff)) {
    gaps.push(createGap('handoff-needs-review', 'caseClosureChecklist.gapHandoffNeedsReview', handoff))
  }

  return gaps
}

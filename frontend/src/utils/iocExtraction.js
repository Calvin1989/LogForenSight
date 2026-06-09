const IPV4_REGEX = /(?<![\d.])(?:25[0-5]|2[0-4]\d|1?\d?\d)(?:\.(?:25[0-5]|2[0-4]\d|1?\d?\d)){3}(?![\d.])/g
const URL_REGEX = /\bhttps?:\/\/[^\s<>"')\]]+/gi
const WINDOWS_PATH_REGEX = /\b[A-Za-z]:\\(?:[^\\/:*?"<>|\r\n\s]+\\)*[^\\/:*?"<>|\r\n\s]*/g
const LINUX_PATH_REGEX = /(?<!https?:)\/(?:[A-Za-z0-9._~!$&'()*+,;=:@%-]+\/)*[A-Za-z0-9._~!$&'()*+,;=:@%-]*/g
const REQUEST_PATH_REGEX = /\b(?:GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\s+([/?][^\s"]*)/gi
const HTTP_METHOD_REGEX = /\b(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS)\b/g
const HTTP_STATUS_REGEX = /(?:HTTP\/\d(?:\.\d)?"\s+|status\s*[=:]\s*)([1-5]\d{2})\b/gi
const USERNAME_REGEX = /\b(?:user(?:name)?|account|src_user|dst_user)\s*[=:]\s*["']?([A-Za-z0-9._@-]+)["']?/gi
const TRAILING_PUNCTUATION_REGEX = /[),.;]+$/
const ENTITY_TYPES = [
  'account',
  'http_method',
  'http_status',
  'ip',
  'path',
  'source_file',
  'url'
]
const TEXT_KEYS_FOR_SOURCE_FILE = ['filename', 'source_file', 'source']

function normalizeMatch(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim().replace(TRAILING_PUNCTUATION_REGEX, '')
}

function normalizeTypeValue(type, value) {
  const normalized = normalizeMatch(value)
  if (!normalized) return ''

  if (type === 'url') return normalized
  if (type === 'windows_path' || type === 'path') return normalized
  if (type === 'source_file') return normalized
  return normalized.toLowerCase()
}

function toIsoTimestamp(value) {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return parsed.toISOString()
}

function ensureEntity(store, type, value, timestamp, sourceFile) {
  const normalizedValue = normalizeTypeValue(type, value)
  if (!normalizedValue) return

  const entityKey = `${type}:${normalizedValue}`
  if (!store.has(entityKey)) {
    store.set(entityKey, {
      type,
      value: type === 'ip' || type === 'account' || type === 'http_method' || type === 'http_status'
        ? normalizedValue
        : normalizeMatch(value),
      count: 0,
      firstSeen: null,
      lastSeen: null,
      relatedSourceFiles: new Set()
    })
  }

  const entity = store.get(entityKey)
  entity.count += 1

  if (timestamp) {
    if (!entity.firstSeen || timestamp < entity.firstSeen) {
      entity.firstSeen = timestamp
    }
    if (!entity.lastSeen || timestamp > entity.lastSeen) {
      entity.lastSeen = timestamp
    }
  }

  const normalizedSourceFile = normalizeMatch(sourceFile)
  if (normalizedSourceFile) {
    entity.relatedSourceFiles.add(normalizedSourceFile)
  }
}

function extractMatches(regex, text, captureGroup = 0) {
  const matches = []
  regex.lastIndex = 0
  let match = regex.exec(text)

  while (match) {
    matches.push(match[captureGroup] ?? match[0])
    match = regex.exec(text)
  }

  return matches
}

function extractSourceFile(candidate) {
  if (!candidate || typeof candidate !== 'object') return ''
  for (const key of TEXT_KEYS_FOR_SOURCE_FILE) {
    if (candidate[key]) {
      return String(candidate[key])
    }
  }
  return ''
}

function collectScalarValues(value, accumulator) {
  if (value === null || value === undefined) return

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    accumulator.push(String(value))
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectScalarValues(item, accumulator))
    return
  }

  if (typeof value === 'object') {
    Object.values(value).forEach((item) => collectScalarValues(item, accumulator))
  }
}

function collectRecordsFromItem(item, accumulator, options = {}) {
  if (!item || typeof item !== 'object') return

  const timestamp = toIsoTimestamp(item.timestamp || options.timestamp)
  const sourceFile = extractSourceFile(item) || options.sourceFile || ''
  const scalarValues = []

  collectScalarValues(item, scalarValues)
  scalarValues.forEach((text) => {
    accumulator.push({
      text,
      timestamp,
      sourceFile
    })
  })
}

function seedFromSummary(analysisResult, entitiesByKey) {
  const topIps = Array.isArray(analysisResult?.summary?.top_ips) ? analysisResult.summary.top_ips : []
  const topPaths = Array.isArray(analysisResult?.summary?.top_paths) ? analysisResult.summary.top_paths : []

  const hasIp = Array.from(entitiesByKey.values()).some((entity) => entity.type === 'ip')
  const hasPath = Array.from(entitiesByKey.values()).some((entity) => entity.type === 'path')

  if (!hasIp) {
    topIps.forEach((entry) => {
      const repeats = Math.max(1, Number(entry?.count) || 1)
      for (let index = 0; index < repeats; index += 1) {
        ensureEntity(entitiesByKey, 'ip', entry?.ip, null, '')
      }
    })
  }

  if (!hasPath) {
    topPaths.forEach((entry) => {
      const repeats = Math.max(1, Number(entry?.count) || 1)
      for (let index = 0; index < repeats; index += 1) {
        ensureEntity(entitiesByKey, 'path', entry?.path, null, '')
      }
    })
  }
}

function extractFromRecord(record, entitiesByKey) {
  const text = normalizeMatch(record.text)
  if (!text) return

  const timestamp = record.timestamp || null
  const sourceFile = record.sourceFile || ''

  extractMatches(IPV4_REGEX, text).forEach((match) => {
    ensureEntity(entitiesByKey, 'ip', match, timestamp, sourceFile)
  })

  extractMatches(URL_REGEX, text).forEach((match) => {
    ensureEntity(entitiesByKey, 'url', match, timestamp, sourceFile)
  })

  extractMatches(WINDOWS_PATH_REGEX, text).forEach((match) => {
    ensureEntity(entitiesByKey, 'path', match, timestamp, sourceFile)
  })

  extractMatches(LINUX_PATH_REGEX, text).forEach((match) => {
    if (match === '/' || match.startsWith('//')) return
    if (/^\/\d+(?:\.\d+)+$/.test(match)) return
    ensureEntity(entitiesByKey, 'path', match, timestamp, sourceFile)
  })

  extractMatches(REQUEST_PATH_REGEX, text, 1).forEach((match) => {
    ensureEntity(entitiesByKey, 'path', match, timestamp, sourceFile)
  })

  extractMatches(HTTP_METHOD_REGEX, text).forEach((match) => {
    ensureEntity(entitiesByKey, 'http_method', match, timestamp, sourceFile)
  })

  extractMatches(HTTP_STATUS_REGEX, text, 1).forEach((match) => {
    ensureEntity(entitiesByKey, 'http_status', match, timestamp, sourceFile)
  })

  extractMatches(USERNAME_REGEX, text, 1).forEach((match) => {
    ensureEntity(entitiesByKey, 'account', match, timestamp, sourceFile)
  })
}

function collectStructuredRecords(analysisResult) {
  const records = []

  ;(analysisResult?.findings || []).forEach((finding) => {
    collectRecordsFromItem(finding, records, {
      sourceFile: extractSourceFile(finding?.metadata) || ''
    })
    if (finding?.metadata) {
      collectRecordsFromItem(finding.metadata, records, {
        sourceFile: extractSourceFile(finding.metadata) || ''
      })
    }
  })

  ;(analysisResult?.incidents || []).forEach((incident) => {
    collectRecordsFromItem(incident, records)
  })

  ;(analysisResult?.timeline_events || []).forEach((event) => {
    collectRecordsFromItem(event, records)
  })

  return records
}

function appendReportFallbackRecord(analysisResult, records) {
  if (records.length > 0) return
  if (analysisResult?.report_markdown) {
    records.push({
      text: analysisResult.report_markdown,
      timestamp: null,
      sourceFile: ''
    })
  }
}

function appendSourceFileEntities(analysisResult, entitiesByKey) {
  const sourceFiles = Array.isArray(analysisResult?.source_files) ? analysisResult.source_files : []
  sourceFiles.forEach((file) => {
    if (!file?.filename) return
    ensureEntity(entitiesByKey, 'source_file', file.filename, null, file.filename)
  })
}

function sortEntities(entities) {
  return entities.sort((left, right) => {
    const typeOrder = left.type.localeCompare(right.type)
    if (typeOrder !== 0) return typeOrder
    if (left.count !== right.count) return right.count - left.count
    return left.value.localeCompare(right.value)
  })
}

export function extractInvestigationEntities(analysisResult) {
  const entitiesByKey = new Map()
  const records = collectStructuredRecords(analysisResult)

  appendReportFallbackRecord(analysisResult, records)

  records.forEach((record) => {
    extractFromRecord(record, entitiesByKey)
  })

  appendSourceFileEntities(analysisResult, entitiesByKey)
  seedFromSummary(analysisResult, entitiesByKey)

  const entities = sortEntities(
    Array.from(entitiesByKey.values())
      .filter((entity) => ENTITY_TYPES.includes(entity.type))
      .map((entity) => ({
        type: entity.type,
        value: entity.type === 'http_method' ? entity.value.toUpperCase() : entity.value,
        count: entity.count,
        firstSeen: entity.firstSeen,
        lastSeen: entity.lastSeen,
        relatedSourceFiles: Array.from(entity.relatedSourceFiles).sort((left, right) => left.localeCompare(right))
      }))
  )

  const countsByType = entities.reduce((accumulator, entity) => {
    accumulator[entity.type] = (accumulator[entity.type] || 0) + 1
    return accumulator
  }, {})

  return {
    entities,
    countsByType
  }
}

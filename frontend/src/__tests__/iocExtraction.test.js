import { describe, expect, it } from 'vitest'
import { extractInvestigationEntities } from '../utils/iocExtraction'

function findEntity(entities, type, value) {
  return entities.find((entity) => entity.type === type && entity.value === value)
}

describe('iocExtraction', () => {
  it('extracts IPv4, URLs, paths, accounts, methods, statuses, and source files with deduped counts', () => {
    const { entities } = extractInvestigationEntities({
      findings: [
        {
          rule_id: 'sensitive_path_probe',
          title: 'Sensitive Path Probe',
          description: 'user=alice requested https://portal.example.com/admin/login from 203.0.113.10',
          matched_values: ['203.0.113.10', '/admin/login'],
          evidence: [
            '203.0.113.10 - - [09/Jun/2026:10:00:00 +0000] "POST /admin/login HTTP/1.1" 401 512 "-" "Mozilla/5.0" src_user=alice',
            'version 1.2.3 should not be parsed as an IP'
          ],
          metadata: {
            context: 'dst_user=svc.portal windows_path=C:\\inetpub\\wwwroot\\web.config linux_path=/var/log/nginx/access.log',
            source_file: 'batch-a.log'
          }
        }
      ],
      incidents: [
        {
          incident_id: 'inc-1',
          title: 'Credential Attack',
          source_ip: '203.0.113.10',
          summary: 'account=alice retried login against /admin/login',
          evidence: ['username=alice status=401'],
          recommendations: []
        }
      ],
      timeline_events: [
        {
          event_id: 'evt-1',
          timestamp: '2026-06-09T10:00:00Z',
          source_ip: '203.0.113.10',
          title: 'POST /admin/login',
          description: 'src_user=alice request failed with status=401',
          evidence: 'POST /admin/login HTTP/1.1" 401',
          source_file: 'batch-a.log'
        },
        {
          event_id: 'evt-2',
          timestamp: '2026-06-09T10:05:00Z',
          source_ip: '198.51.100.25',
          title: 'GET /health',
          description: 'user=svc.portal requested http://intranet.example.local/health',
          evidence: 'GET /health HTTP/1.1" 200',
          source_file: 'batch-b.log'
        }
      ],
      source_files: [
        { filename: 'batch-a.log' },
        { filename: 'batch-b.log' }
      ]
    })

    expect(findEntity(entities, 'ip', '203.0.113.10')?.count).toBeGreaterThanOrEqual(4)
    expect(findEntity(entities, 'ip', '1.2.3')).toBeUndefined()
    expect(findEntity(entities, 'url', 'https://portal.example.com/admin/login')).toBeTruthy()
    expect(findEntity(entities, 'url', 'http://intranet.example.local/health')).toBeTruthy()
    expect(findEntity(entities, 'path', '/admin/login')).toBeTruthy()
    expect(findEntity(entities, 'path', 'C:\\inetpub\\wwwroot\\web.config')).toBeTruthy()
    expect(findEntity(entities, 'path', '/var/log/nginx/access.log')).toBeTruthy()
    expect(findEntity(entities, 'account', 'alice')?.count).toBeGreaterThanOrEqual(4)
    expect(findEntity(entities, 'account', 'svc.portal')).toBeTruthy()
    expect(findEntity(entities, 'http_method', 'POST')?.count).toBeGreaterThanOrEqual(2)
    expect(findEntity(entities, 'http_status', '401')?.count).toBeGreaterThanOrEqual(3)
    expect(findEntity(entities, 'source_file', 'batch-a.log')?.count).toBe(1)
    expect(findEntity(entities, 'source_file', 'batch-b.log')?.count).toBe(1)
  })

  it('tracks first/last seen and related source files in a stable sort order', () => {
    const { entities } = extractInvestigationEntities({
      timeline_events: [
        {
          event_id: 'evt-1',
          timestamp: '2026-06-09T09:55:00Z',
          source_ip: '203.0.113.10',
          description: 'GET /login HTTP/1.1" 200',
          source_file: 'alpha.log'
        },
        {
          event_id: 'evt-2',
          timestamp: '2026-06-09T10:05:00Z',
          source_ip: '203.0.113.10',
          description: 'GET /login HTTP/1.1" 200',
          source_file: 'beta.log'
        }
      ]
    })

    const ipEntity = findEntity(entities, 'ip', '203.0.113.10')
    expect(ipEntity?.firstSeen).toBe('2026-06-09T09:55:00.000Z')
    expect(ipEntity?.lastSeen).toBe('2026-06-09T10:05:00.000Z')
    expect(ipEntity?.relatedSourceFiles).toEqual(['alpha.log', 'beta.log'])
    expect(entities.map((entity) => entity.type)).toEqual([...entities.map((entity) => entity.type)].sort((left, right) => left.localeCompare(right)))
  })

  it('falls back to summary aggregates and empty results without throwing', () => {
    const fallbackOnly = extractInvestigationEntities({
      summary: {
        top_ips: [{ ip: '192.0.2.10', count: 2 }],
        top_paths: [{ path: '/api/login', count: 3 }]
      }
    })

    expect(findEntity(fallbackOnly.entities, 'ip', '192.0.2.10')?.count).toBe(2)
    expect(findEntity(fallbackOnly.entities, 'path', '/api/login')?.count).toBe(3)

    const emptyResult = extractInvestigationEntities(null)
    expect(emptyResult.entities).toEqual([])
    expect(emptyResult.countsByType).toEqual({})
  })

  it('can extract from report markdown when structured collections are missing', () => {
    const { entities } = extractInvestigationEntities({
      report_markdown: 'Observed GET /admin from 203.0.113.7 with username=analyst and https://portal.example.com/admin returning status=403'
    })

    expect(findEntity(entities, 'ip', '203.0.113.7')).toBeTruthy()
    expect(findEntity(entities, 'account', 'analyst')).toBeTruthy()
    expect(findEntity(entities, 'url', 'https://portal.example.com/admin')).toBeTruthy()
    expect(findEntity(entities, 'http_method', 'GET')).toBeTruthy()
    expect(findEntity(entities, 'http_status', '403')).toBeTruthy()
  })
})

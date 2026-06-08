import { describe, it, expect, vi } from 'vitest'
import { 
  convertIncidentsToCsv, 
  convertFindingsToCsv, 
  buildAnalysisSummaryExport,
  downloadJson
} from '../utils/exportUtils'

describe('exportUtils', () => {
  describe('convertIncidentsToCsv', () => {
    it('correctly converts incidents to CSV with escaping', () => {
      const incidents = [
        {
          incident_id: 'inc1',
          title: 'Title with, comma',
          severity: 'high',
          source_ip: '1.1.1.1',
          confidence: 'high',
          summary: 'Summary with "quotes" and\nnewline',
          related_rule_ids: ['rule1', 'rule2'],
          recommendations: ['rec1', 'rec2']
        }
      ]

      const csv = convertIncidentsToCsv(incidents)
      
      expect(csv).toContain('incident_id,title,severity,source_ip,confidence,summary,related_rule_ids,recommendations')
      // Check escaping
      expect(csv).toContain('inc1')
      expect(csv).toContain('"Title with, comma"')
      expect(csv).toContain('"Summary with ""quotes"" and\nnewline"')
      expect(csv).toContain('rule1; rule2')
      expect(csv).toContain('rec1; rec2')
    })

    it('returns empty string for empty input', () => {
      expect(convertIncidentsToCsv([])).toBe('')
      expect(convertIncidentsToCsv(null)).toBe('')
    })
  })

  describe('convertFindingsToCsv', () => {
    it('correctly converts findings to CSV', () => {
      const findings = [
        {
          rule_id: 'rule1',
          title: 'Finding 1',
          severity: 'low',
          description: 'Desc',
          matched_count: 5,
          matched_fields: ['f1', 'f2'],
          matched_values: ['v1', 'v2'],
          recommendation: 'Rec'
        }
      ]

      const csv = convertFindingsToCsv(findings)
      const lines = csv.split('\n')
      
      expect(lines[0]).toBe('rule_id,title,severity,description,matched_count,matched_fields,matched_values,recommendation')
      expect(lines[1]).toBe('rule1,Finding 1,low,Desc,5,f1; f2,v1; v2,Rec')
    })
  })

  describe('buildAnalysisSummaryExport', () => {
    it('builds summary export object without full evidence', () => {
      const mockResult = {
        summary: { total_requests: 100, finding_severity_counts: { high: 1 } },
        parse_stats: { parsed_lines: 90 },
        incidents: [{ id: 1 }, { id: 2 }],
        findings: [
          { rule_id: 'r1', evidence: ['very long evidence line'] }
        ],
        executive_summary: { risk_score: 50, overall_risk_level: 'medium' }
      }

      const exported = buildAnalysisSummaryExport(mockResult)
      
      expect(exported.summary.total_requests).toBe(100)
      expect(exported.parse_stats.parsed_lines).toBe(90)
      expect(exported.incident_count).toBe(2)
      expect(exported.finding_count).toBe(1)
      expect(exported.executive_summary.risk_score).toBe(50)
      expect(exported.exported_at).toBeDefined()
      // Ensure we don't accidentally include the full findings array if we didn't mean to,
      // though the requirement just says "should not contain full evidence".
      // Our implementation currently just takes what it needs.
      expect(exported.findings).toBeUndefined()
    })
  })

  describe('downloadJson', () => {
    it('calls download logic (smoke test with mocks)', () => {
      // Mock URL and document methods
      const createObjectURLMock = vi.fn(() => 'mock-url')
      const revokeObjectURLMock = vi.fn()
      global.URL.createObjectURL = createObjectURLMock
      global.URL.revokeObjectURL = revokeObjectURLMock
      
      // Mock anchor click to avoid jsdom navigation warning
      const clickMock = vi.fn()
      const originalClick = HTMLAnchorElement.prototype.click
      HTMLAnchorElement.prototype.click = clickMock

      const appendChildMock = vi.spyOn(document.body, 'appendChild').mockImplementation(() => {})
      const removeChildMock = vi.spyOn(document.body, 'removeChild').mockImplementation(() => {})
      
      const mockData = { test: 123 }
      downloadJson('test.json', mockData)
      
      expect(createObjectURLMock).toHaveBeenCalled()
      expect(appendChildMock).toHaveBeenCalled()
      expect(clickMock).toHaveBeenCalled()
      expect(removeChildMock).toHaveBeenCalled()
      expect(revokeObjectURLMock).toHaveBeenCalled()

      // Restore click
      HTMLAnchorElement.prototype.click = originalClick
    })
  })
})

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FindingsList from '../components/FindingsList.vue'

describe('FindingsList.vue', () => {
  const mockFindings = [
    {
      rule_id: 'high_frequency_ip',
      title: 'High Frequency Request',
      severity: 'medium',
      description: 'IP 1.1.1.1 made 10 requests',
      recommendation: 'Block it',
      evidence: ['ev1', 'ev2'],
      metadata: { ip: '1.1.1.1', count: 10 },
      matched_count: 10,
      matched_fields: ['ip'],
      matched_values: ['1.1.1.1']
    },
    {
      rule_id: 'sensitive_path_probe',
      title: 'Sensitive Path Probing',
      severity: 'high',
      description: 'IP 2.2.2.2 probed paths',
      recommendation: 'Block it',
      evidence: ['ev1'],
      metadata: { ip: '2.2.2.2' },
      matched_count: 3,
      matched_fields: ['path'],
      matched_values: ['/.env', '/admin', '/config', '/.git', '/phpmyadmin', '/wp-login.php']
    }
  ]

  it('renders matched details correctly', () => {
    const wrapper = mount(FindingsList, {
      props: { findings: mockFindings }
    })

    const hfFinding = wrapper.findAll('.finding-item')[0]
    expect(hfFinding.text()).toContain('Matched Details:')
    expect(hfFinding.text()).toContain('Count: 10')
    expect(hfFinding.text()).toContain('Fields: ip')
    expect(hfFinding.text()).toContain('1.1.1.1')
  })

  it('renders export buttons', () => {
    const wrapper = mount(FindingsList, {
      props: { findings: mockFindings }
    })

    expect(wrapper.find('.export-btn[title*="JSON"]').exists()).toBe(true)
    expect(wrapper.find('.export-btn[title*="CSV"]').exists()).toBe(true)
    expect(wrapper.find('.export-warning').exists()).toBe(true)
  })

  it('handles more than 5 matched values with toggle', async () => {
    const wrapper = mount(FindingsList, {
      props: { findings: mockFindings }
    })

    const spFinding = wrapper.findAll('.finding-item')[1]
    
    // Initially should show 5 tags + "more"
    const tags = spFinding.findAll('.matched-tag')
    expect(tags.length).toBe(5)
    expect(spFinding.find('.matched-tag-more').exists()).toBe(true)
    expect(spFinding.find('.matched-tag-more').text()).toContain('+1 more')

    const toggleBtn = spFinding.find('.toggle-matched-btn')
    expect(toggleBtn.text()).toBe('Show all matched values')

    // Click toggle
    await toggleBtn.trigger('click')
    
    // Should show all 6 tags
    const allTags = spFinding.findAll('.matched-tag')
    expect(allTags.length).toBe(6)
    expect(spFinding.find('.matched-tag-more').exists()).toBe(false)
    expect(toggleBtn.text()).toBe('Show less')
  })

  it('safely handles legacy findings missing matched_* fields', () => {
    const legacyFindings = [
      {
        rule_id: 'legacy_rule',
        title: 'Legacy Finding',
        severity: 'low',
        description: 'No matched details here',
        recommendation: 'Update your app',
        evidence: ['old evidence'],
        metadata: { ip: '9.9.9.9' }
        // missing matched_count, matched_fields, matched_values
      }
    ]

    const wrapper = mount(FindingsList, {
      props: { findings: legacyFindings }
    })

    const finding = wrapper.find('.finding-item')
    expect(finding.text()).toContain('Legacy Finding')
    // Should NOT contain Matched Details section
    expect(finding.find('.finding-matched-details').exists()).toBe(false)
    expect(finding.text()).not.toContain('Matched Details:')
  })
})

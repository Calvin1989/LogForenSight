import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import RuleTuningPanel from '../components/RuleTuningPanel.vue';

// Mock i18n
vi.mock('../i18n', () => ({
  t: (key) => key
}));

describe('RuleTuningPanel', () => {
  const initialConfig = {
    high_frequency_threshold: 10,
    path_scanning_404_threshold: 5,
    sensitive_paths: ['/admin'],
    suspicious_user_agents: ['sqlmap']
  };

  it('renders "no file" message when hasFile is false', () => {
    const wrapper = mount(RuleTuningPanel, {
      props: {
        initialConfig,
        hasFile: false
      }
    });
    expect(wrapper.text()).toContain('ruleTuning.noFile');
  });

  it('renders input fields when hasFile is true', () => {
    const wrapper = mount(RuleTuningPanel, {
      props: {
        initialConfig,
        hasFile: true
      }
    });
    expect(wrapper.find('input[type="number"]').exists()).toBe(true);
    expect(wrapper.find('textarea').exists()).toBe(true);
    expect(wrapper.find('input[type="checkbox"]').exists()).toBe(true);
  });

  it('emits apply event with correct data when apply button is clicked', async () => {
    const wrapper = mount(RuleTuningPanel, {
      props: {
        initialConfig,
        hasFile: true
      }
    });

    // Change some values
    const freqInput = wrapper.findAll('input[type="number"]')[0];
    await freqInput.setValue(20);

    const applyBtn = wrapper.find('.btn-primary');
    await applyBtn.trigger('click');

    expect(wrapper.emitted().apply).toBeTruthy();
    expect(wrapper.emitted().apply[0][0]).toMatchObject({
      high_frequency_threshold: 20,
      disabled_rules: []
    });
  });

  it('emits reset event when reset button is clicked', async () => {
    const wrapper = mount(RuleTuningPanel, {
      props: {
        initialConfig,
        hasFile: true
      }
    });

    const resetBtn = wrapper.find('.btn-secondary');
    await resetBtn.trigger('click');

    expect(wrapper.emitted().reset).toBeTruthy();
  });

  it('shows warnings if provided', () => {
    const warnings = ['Warning 1', 'Warning 2'];
    const wrapper = mount(RuleTuningPanel, {
      props: {
        initialConfig,
        hasFile: true,
        warnings
      }
    });

    expect(wrapper.find('.warnings-box').exists()).toBe(true);
    expect(wrapper.text()).toContain('Warning 1');
    expect(wrapper.text()).toContain('Warning 2');
  });

  it('disables inputs when isAnalyzing is true', () => {
    const wrapper = mount(RuleTuningPanel, {
      props: {
        initialConfig,
        hasFile: true,
        isAnalyzing: true
      }
    });

    expect(wrapper.find('input[type="number"]').element.disabled).toBe(true);
    expect(wrapper.find('.btn-primary').element.disabled).toBe(true);
  });
});

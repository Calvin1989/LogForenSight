import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import FileUpload from '../components/FileUpload.vue'
import { setLanguage } from '../i18n'

describe('FileUpload', () => {
  beforeEach(() => {
    setLanguage('en')
  })

  it('renders initial state', () => {
    const wrapper = mount(FileUpload, {
      props: { loading: false }
    })

    expect(wrapper.text()).toContain('Choose a .log or .txt file')
    expect(wrapper.find('button').element.disabled).toBe(true)
  })

  it('shows single file name after selecting one file', async () => {
    const wrapper = mount(FileUpload, {
      props: { loading: false }
    })
    const file = new File(['log'], 'access.log', { type: 'text/plain' })

    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      value: [file],
      configurable: true
    })
    await input.trigger('change')

    expect(wrapper.text()).toContain('access.log')
  })

  it('shows selected files count after selecting multiple files', async () => {
    const wrapper = mount(FileUpload, {
      props: { loading: false }
    })
    const files = [
      new File(['a'], 'first.log', { type: 'text/plain' }),
      new File(['b'], 'second.log', { type: 'text/plain' })
    ]

    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      value: files,
      configurable: true
    })
    await input.trigger('change')

    expect(wrapper.text()).toContain('2 files selected')
    expect(wrapper.text()).toContain('Analyze 2 files')
  })

  it('emits File array when analyzing multiple files', async () => {
    const wrapper = mount(FileUpload, {
      props: { loading: false }
    })
    const files = [
      new File(['a'], 'first.log', { type: 'text/plain' }),
      new File(['b'], 'second.log', { type: 'text/plain' })
    ]

    const input = wrapper.find('input[type="file"]')
    Object.defineProperty(input.element, 'files', {
      value: files,
      configurable: true
    })
    await input.trigger('change')
    await wrapper.find('button').trigger('click')

    expect(wrapper.emitted().analyze).toBeTruthy()
    expect(wrapper.emitted().analyze[0][0]).toEqual(files)
    expect(wrapper.emitted().analyze[0][1]).toBe('auto')
  })
})

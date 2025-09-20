import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Toast from '@/components/ui/toast/Toast.vue'

describe('Toast.vue', () => {
  it('renders with success variant', () => {
    const wrapper = mount(Toast, {
      props: {
        title: 'Success',
        description: 'Message',
        type: 'success'
      }
    })
    // Check for a class unique to the success variant
    expect(wrapper.classes()).toContain('bg-green-50')
    expect(wrapper.text()).toContain('Success')
  })

  it('renders with error variant', () => {
    const wrapper = mount(Toast, {
      props: {
        title: 'Error',
        description: 'Message',
        type: 'error'
      }
    })
    // Check for a class unique to the error variant
    expect(wrapper.classes()).toContain('bg-red-50')
    expect(wrapper.text()).toContain('Error')
  })

  it('emits close event when close button is clicked', async () => {
    const wrapper = mount(Toast, {
      props: {
        title: 'Test',
        description: 'Message',
        type: 'success'
      }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})

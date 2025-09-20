import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { Alert } from '@/components/ui/alert'

describe('Alert.vue', () => {
  it('renders with default variant', () => {
    const wrapper = mount(Alert, {
      slots: {
        default: 'This is an alert'
      }
    })
    expect(wrapper.find('[data-slot="alert"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('This is an alert')
    // Check for a class unique to the default variant
    expect(wrapper.classes()).toContain('bg-card')
  })

  it('renders with destructive variant', () => {
    const wrapper = mount(Alert, {
      props: {
        variant: 'destructive'
      },
      slots: {
        default: 'This is a destructive alert'
      }
    })
    expect(wrapper.text()).toContain('This is a destructive alert')
    // Check for a class unique to the destructive variant
    expect(wrapper.classes()).toContain('text-destructive')
  })

  it('has the correct role attribute', () => {
    const wrapper = mount(Alert)
    expect(wrapper.attributes('role')).toBe('alert')
  })
})

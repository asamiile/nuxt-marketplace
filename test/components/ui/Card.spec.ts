import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

describe('Card.vue', () => {
  it('renders content correctly via slots', () => {
    const wrapper = mount(Card, {
      slots: {
        default: `
          <CardHeader>Header Content</CardHeader>
          <CardContent>Body Content</CardContent>
        `
      },
      global: {
        components: {
          CardHeader,
          CardContent
        }
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Header Content')
    expect(text).toContain('Body Content')

    // Also check if the specific slot components are rendered
    expect(wrapper.find('[data-slot="card-header"]').exists()).toBe(true)
    expect(wrapper.find('[data-slot="card-content"]').exists()).toBe(true)
  })
})

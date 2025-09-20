import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import Button from '~/components/ui/button/Button.vue'

describe('Button.vue', () => {
  it('renders slot content', () => {
    const wrapper = mount(Button, {
      slots: {
        default: 'Click Me',
      },
    })
    expect(wrapper.text()).toBe('Click Me')
  })

  it('emits a click event when clicked', async () => {
    const wrapper = mount(Button)
    await wrapper.trigger('click')
    // The 'click' event should be emitted once
    expect(wrapper.emitted('click')).toHaveLength(1)
  })

  it('does not emit a click event when disabled', async () => {
    const wrapper = mount(Button, {
      attrs: {
        disabled: true,
      },
    })
    // Check if the disabled attribute is present
    expect(wrapper.attributes('disabled')).toBeDefined()

    // Trigger a click
    await wrapper.trigger('click')

    // No 'click' event should be emitted
    expect(wrapper.emitted('click')).toBeUndefined()
  })

  it('applies correct variant and size classes', () => {
    const wrapper = mount(Button, {
      props: {
        variant: 'destructive',
        size: 'sm',
      },
    })
    // This is a snapshot test to check the generated classes.
    // It's a bit brittle but useful for UI components.
    // The exact class names depend on the implementation of buttonVariants.
    // We expect it to contain something related to 'destructive' and 'sm'.
    const classList = wrapper.classes().join(' ')
    expect(classList).toContain('bg-destructive')
    expect(classList).toContain('h-9') // Assuming 'sm' size corresponds to h-9
  })
})

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'

describe('Skeleton.vue', () => {
  it('renders correctly with default classes', () => {
    const wrapper = mount(Skeleton)

    const skeleton = wrapper.find('[data-slot="skeleton"]')
    expect(skeleton.exists()).toBe(true)

    // Check for base classes
    expect(skeleton.classes()).toContain('animate-pulse')
    expect(skeleton.classes()).toContain('rounded-md')
    expect(skeleton.classes()).toContain('bg-primary/10')
  })

  it('applies additional classes when passed', () => {
    const wrapper = mount(Skeleton, {
      props: {
        class: 'w-full h-4'
      }
    })

    const skeleton = wrapper.find('[data-slot="skeleton"]')
    expect(skeleton.classes()).toContain('w-full')
    expect(skeleton.classes()).toContain('h-4')
    // Ensure base classes are still there
    expect(skeleton.classes()).toContain('animate-pulse')
  })
})

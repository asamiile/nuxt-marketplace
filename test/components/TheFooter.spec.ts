import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import { defineComponent } from 'vue'
import TheFooter from '~/components/TheFooter.vue'

// Create a custom stub for NuxtLink that renders its default slot.
// By default, `stubs: { NuxtLink: true }` creates a stub that does not render content.
const NuxtLinkStub = defineComponent({
  template: '<a><slot /></a>',
})

describe('TheFooter.vue', () => {
  it('renders the copyright notice', () => {
    const wrapper = mount(TheFooter, {
      global: {
        stubs: {
          NuxtLink: NuxtLinkStub,
        },
      },
    })
    // Check for the copyright text. Using a regex to be flexible with whitespace.
    expect(wrapper.text()).toMatch(/© 2025 Marketplace All rights reserved./)
  })

  it('renders navigation links', () => {
    const wrapper = mount(TheFooter, {
      global: {
        stubs: {
          NuxtLink: NuxtLinkStub,
        },
      },
    })
    const text = wrapper.text()
    expect(text).toContain('利用規約')
    expect(text).toContain('プライバシーポリシー')
    expect(text).toContain('お問い合わせ')
  })
})

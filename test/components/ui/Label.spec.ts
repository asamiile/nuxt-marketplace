import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import Label from '@/components/ui/label/Label.vue'

describe('Label.vue', () => {
  it('sets the "for" attribute correctly', () => {
    const wrapper = mount(Label, {
      props: {
        for: 'username'
      }
    })

    const labelElement = wrapper.find('label')
    expect(labelElement.attributes('for')).toBe('username')
  })
})

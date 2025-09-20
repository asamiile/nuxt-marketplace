import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import Input from '@/components/ui/input/Input.vue'

describe('Input.vue', () => {
  it('synchronizes with v-model', async () => {
    const text = ref('initial text')
    const wrapper = mount({
        template: '<Input v-model="text" />',
        components: { Input },
        setup() {
            return { text }
        }
    })

    const inputElement = wrapper.find('input')

    // 1. Initial state
    expect((inputElement.element as HTMLInputElement).value).toBe('initial text')

    // 2. User types in input -> model updates
    await inputElement.setValue('new text')
    expect(text.value).toBe('new text')

    // 3. Model updates -> input updates
    text.value = 'updated from parent'
    await nextTick()
    expect((inputElement.element as HTMLInputElement).value).toBe('updated from parent')
  })
})

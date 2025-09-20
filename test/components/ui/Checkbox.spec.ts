import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import { nextTick } from 'vue'

describe('Checkbox.vue', () => {
  it('synchronizes with v-model', async () => {
    const isChecked = ref(false)
    const wrapper = mount({
        template: '<Checkbox v-model:checked="isChecked" />',
        components: { Checkbox },
        setup() {
            return { isChecked }
        }
    })

    const checkboxInput = wrapper.find('input[type="checkbox"]')

    // 1. Initial state
    expect((checkboxInput.element as HTMLInputElement).checked).toBe(false)

    // 2. User clicks checkbox -> model updates
    await checkboxInput.setValue(true)
    expect(isChecked.value).toBe(true)

    // 3. Model updates -> checkbox updates
    isChecked.value = false
    await nextTick()
    expect((checkboxInput.element as HTMLInputElement).checked).toBe(false)
  })
})

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import Textarea from '@/components/ui/textarea/Textarea.vue'

describe('Textarea.vue', () => {
  it('synchronizes with v-model', async () => {
    const text = ref('initial text')
    const wrapper = mount({
        template: '<Textarea v-model="text" />',
        components: { Textarea },
        setup() {
            return { text }
        }
    })

    const textareaElement = wrapper.find('textarea')

    // 1. Initial state
    expect((textareaElement.element as HTMLTextAreaElement).value).toBe('initial text')

    // 2. User types in textarea -> model updates
    await textareaElement.setValue('new text')
    expect(text.value).toBe('new text')

    // 3. Model updates -> textarea updates
    text.value = 'updated from parent'
    await nextTick()
    expect((textareaElement.element as HTMLTextAreaElement).value).toBe('updated from parent')
  })
})

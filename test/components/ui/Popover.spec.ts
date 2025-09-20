import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

describe('Popover.vue', () => {
  it('toggles content visibility on trigger click', async () => {
    const wrapper = mount({
      template: `
        <Popover>
          <PopoverTrigger>
            <button>Open</button>
          </PopoverTrigger>
          <PopoverContent>
            <div>Popover Content</div>
          </PopoverContent>
        </Popover>
      `,
      components: { Popover, PopoverContent, PopoverTrigger },
    }, {
        // Attach to body to ensure portal content is available
        attachTo: document.body
    })

    // 1. Initially, content does not exist in the DOM
    expect(document.querySelector('[data-slot="popover-content"]')).toBeNull()

    // 2. Click the trigger to open
    const trigger = wrapper.find('button')
    await trigger.trigger('click')
    await nextTick()

    // The content is now rendered and visible
    const content = document.querySelector('[data-slot="popover-content"]')
    expect(content).not.toBeNull()
    expect(content!.getAttribute('data-state')).toBe('open')

    // 3. Click the body to close (simulating clicking outside)
    await document.body.click()
    await nextTick()

    // The popover content should now be in the 'closed' state.
    expect(document.querySelector('[data-slot="popover-content"]')?.getAttribute('data-state')).toBe('closed')

    wrapper.unmount()
  })
})

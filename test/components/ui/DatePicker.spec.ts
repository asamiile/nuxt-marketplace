import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import DatePicker from '@/components/ui/date-picker/DatePicker.vue'

// Mock Popover to be always open for simplicity
vi.mock('@/components/ui/popover', () => ({
  Popover: {
    template: '<div><slot /></div>',
  },
  PopoverTrigger: {
    template: '<button><slot /></button>',
  },
  PopoverContent: {
    template: '<div><slot /></div>',
  }
}));

describe('DatePicker.vue', () => {
  it('updates the model value when a date is selected', async () => {
    const selectedDate = ref<Date | null>(null)
    const wrapper = mount({
      template: '<DatePicker v-model="selectedDate" />',
      components: { DatePicker },
      setup() {
        return { selectedDate }
      },
    })

    // Because the Popover is mocked open, the Calendar should be visible.
    // Let's find a date and click it.
    // The underlying calendar uses a different date object, so we need to be careful.
    // The test for the calendar itself showed how to do this.
    // We'll click on the 15th. The default month is the current month.
    const dateToSelect = '15'
    const dayButton = wrapper.findAll('[data-slot="calendar-cell-trigger"]')
      .find(w => w.text() === dateToSelect && !w.attributes('data-disabled'))

    expect(dayButton).toBeDefined()
    await dayButton!.trigger('click')
    await nextTick()

    // The component should emit an update to the v-model, which is a standard Date object.
    expect(selectedDate.value).toBeInstanceOf(Date)
    // We can't know the exact month/year without more complex setup,
    // but we can check the day.
    expect(selectedDate.value?.getDate()).toBe(15)
  })
})

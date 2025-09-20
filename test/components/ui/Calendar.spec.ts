import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { Calendar } from '@/components/ui/calendar'
import { CalendarDate } from '@internationalized/date'

describe('Calendar.vue', () => {
  it('selects a date when a cell is clicked', async () => {
    const modelValue = new CalendarDate(2024, 7, 1) // July 1, 2024
    const wrapper = mount(Calendar, {
      props: {
        modelValue: modelValue,
      },
    })

    // Find the button for the 15th of the month.
    // The cell trigger component likely has an attribute to identify the date.
    // Based on reka-ui docs, the trigger has a `aria-label` like "Sunday, 14 July 2024".
    // We'll find the button for July 15th.
    const dateToSelect = '15'
    const dayButton = wrapper.findAll('[data-slot="calendar-cell-trigger"]')
      .find(w => w.text() === dateToSelect && !w.attributes('data-disabled'))

    expect(dayButton).toBeDefined()

    await dayButton!.trigger('click')

    // Check for the emitted event
    const updateEvents = wrapper.emitted('update:modelValue')
    expect(updateEvents).toHaveLength(1)

    // Check the payload of the event
    const emittedDate = updateEvents![0][0] as CalendarDate
    expect(emittedDate.year).toBe(2024)
    expect(emittedDate.month).toBe(7)
    expect(emittedDate.day).toBe(15)
  })
})

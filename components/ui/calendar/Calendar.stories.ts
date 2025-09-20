import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { today, getLocalTimeZone } from '@internationalized/date'
import Calendar from './Calendar.vue'

const meta = {
  title: 'ui/Calendar',
  component: Calendar,
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Calendar },
    setup() {
      const value = ref(today(getLocalTimeZone()))
      return { args, value }
    },
    template: `
      <div class="flex gap-4">
        <Calendar v-model="value" />
        <div class="mt-4">
          Selected date: {{ value }}
        </div>
      </div>
    `,
  }),
}

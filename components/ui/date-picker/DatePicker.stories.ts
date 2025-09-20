import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import DatePicker from './DatePicker.vue'

const meta = {
  title: 'ui/DatePicker',
  component: DatePicker,
  tags: ['autodocs'],
} satisfies Meta<typeof DatePicker>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { DatePicker },
    setup() {
      const date = ref<Date | null>(null)
      return { args, date }
    },
    template: `
      <div class="flex gap-4">
        <DatePicker v-model="date" />
        <div class="mt-4">
          Selected date: {{ date }}
        </div>
      </div>
    `,
  }),
}

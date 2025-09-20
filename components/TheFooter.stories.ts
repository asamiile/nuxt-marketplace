import type { Meta, StoryObj } from '@storybook/vue3'
import TheFooter from './TheFooter.vue'

const meta = {
  title: 'layout/TheFooter',
  component: TheFooter,
  tags: ['autodocs'],
} satisfies Meta<typeof TheFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { TheFooter },
    template: '<TheFooter />',
  }),
}

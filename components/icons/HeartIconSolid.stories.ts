import type { Meta, StoryObj } from '@storybook/vue3'
import HeartIconSolid from './HeartIconSolid.vue'

const meta = {
  title: 'icons/HeartIconSolid',
  component: HeartIconSolid,
  tags: ['autodocs'],
} satisfies Meta<typeof HeartIconSolid>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { HeartIconSolid },
    template: '<HeartIconSolid />',
  }),
}

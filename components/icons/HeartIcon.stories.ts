import type { Meta, StoryObj } from '@storybook/vue3'
import HeartIcon from './HeartIcon.vue'

const meta = {
  title: 'icons/HeartIcon',
  component: HeartIcon,
  tags: ['autodocs'],
} satisfies Meta<typeof HeartIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => ({
    components: { HeartIcon },
    template: '<HeartIcon />',
  }),
}

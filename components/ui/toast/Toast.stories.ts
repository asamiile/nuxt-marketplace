import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import Toast from './Toast.vue'

const meta = {
  title: 'ui/ToastComponent',
  component: Toast,
  tags: ['autodocs'],
  args: {
    onClose: fn(),
  },
} satisfies Meta<typeof Toast>

export default meta
type Story = StoryObj<typeof meta>

export const Success: Story = {
  args: {
    title: 'Success!',
    description: 'Your action was successful.',
    type: 'success',
  },
}

export const Error: Story = {
  args: {
    title: 'Error!',
    description: 'Something went wrong.',
    type: 'error',
  },
}

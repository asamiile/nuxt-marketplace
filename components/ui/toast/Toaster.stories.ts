import type { Meta, StoryObj } from '@storybook/vue3'
import { Button } from '../button'
import Toaster from './Toaster.vue'
import { useAlert } from '~/composables/useAlert'

const meta = {
  title: 'ui/Toast',
  component: Toaster,
  tags: ['autodocs'],
} satisfies Meta<typeof Toaster>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Toaster, Button },
    setup() {
      const { showToast } = useAlert()

      const showSuccessToast = () => {
        showToast({
          title: 'Success!',
          message: 'Your action was successful.',
          type: 'success',
        })
      }

      const showErrorToast = () => {
        showToast({
          title: 'Error!',
          message: 'Something went wrong.',
          type: 'error',
        })
      }

      return { args, showSuccessToast, showErrorToast }
    },
    template: `
      <div>
        <Toaster />
        <div class="flex gap-4">
          <Button @click="showSuccessToast">Show Success Toast</Button>
          <Button @click="showErrorToast" variant="destructive">Show Error Toast</Button>
        </div>
      </div>
    `,
  }),
}

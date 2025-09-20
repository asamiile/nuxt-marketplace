import type { Meta, StoryObj } from '@storybook/vue3'
import { Label } from '.'
import { Checkbox } from '../checkbox'

const meta = {
  title: 'ui/Label',
  component: Label,
  tags: ['autodocs'],
} satisfies Meta<typeof Label>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Label, Checkbox },
    setup() {
      return { args }
    },
    template: `
    <div>
      <div class="flex items-center space-x-2">
        <Checkbox id="airplane-mode" />
        <Label for="airplane-mode">Airplane mode</Label>
      </div>
    </div>
    `,
  }),
}

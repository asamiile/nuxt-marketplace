import type { Meta, StoryObj } from '@storybook/vue3'
import { Checkbox } from '.'
import { Label } from '../label'

const meta = {
  title: 'ui/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  argTypes: {
    checked: { control: 'boolean' },
  },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Checkbox, Label },
    setup() {
      return { args }
    },
    template: `
    <div class="flex items-center space-x-2">
      <Checkbox id="terms" :checked="args.checked" />
      <Label
        for="terms"
        class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
      >
        Accept terms and conditions
      </Label>
    </div>
    `,
  }),
  args: {
    checked: false,
  },
}

export const Checked: Story = {
    render: (args) => ({
      components: { Checkbox, Label },
      setup() {
        return { args }
      },
      template: `
      <div class="flex items-center space-x-2">
        <Checkbox id="terms-checked" :checked="args.checked" />
        <Label
          for="terms-checked"
          class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Accept terms and conditions
        </Label>
      </div>
      `,
    }),
    args: {
      checked: true,
    },
  }

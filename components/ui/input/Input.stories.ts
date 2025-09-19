import type { Meta, StoryObj } from '@storybook/vue3'
import Input from './Input.vue'

const meta = {
  title: 'ui/Input',
  component: Input,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Input },
    setup() {
      return { args }
    },
    template: '<Input v-bind="args" />',
  }),
}

import type { Meta, StoryObj } from '@storybook/vue3'
import { Textarea } from '.'
import { Label } from '../label'

const meta = {
  title: 'ui/Textarea',
  component: Textarea,
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Textarea },
    setup() {
      return { args }
    },
    template: `
    <Textarea placeholder="Type your message here." v-bind="args" />
    `,
  }),
}

export const WithLabel: Story = {
    render: (args) => ({
      components: { Textarea, Label },
      setup() {
        return { args }
      },
      template: `
      <div class="grid w-full gap-1.5">
        <Label for="message">Your message</Label>
        <Textarea placeholder="Type your message here." id="message" v-bind="args" />
      </div>
      `,
    }),
  }

import type { Meta, StoryObj } from '@storybook/vue3'
import { Alert, AlertTitle, AlertDescription } from '.'

const meta = {
  title: 'ui/Alert',
  component: Alert,
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive'] },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Alert, AlertTitle, AlertDescription },
    setup() {
      return { args }
    },
    template: `
    <Alert :variant="args.variant">
      <AlertTitle>Heads up!</AlertTitle>
      <AlertDescription>
        You can add components to your app using the cli.
      </AlertDescription>
    </Alert>
    `,
  }),
  args: {
    variant: 'default',
  },
}

export const Destructive: Story = {
    render: (args) => ({
      components: { Alert, AlertTitle, AlertDescription },
      setup() {
        return { args }
      },
      template: `
      <Alert :variant="args.variant">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Your session has expired. Please log in again.
        </AlertDescription>
      </Alert>
      `,
    }),
    args: {
      variant: 'destructive',
    },
  }

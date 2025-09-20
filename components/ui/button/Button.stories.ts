import type { Meta, StoryObj } from '@storybook/vue3'
import { fn } from '@storybook/test'
import Button from './Button.vue'

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta = {
  title: 'ui/Button',
  component: Button,
  // This component will have an automatically generated docsPage entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  argTypes: {
    variant: { control: 'select', options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] },
    size: { control: 'select', options: ['default', 'sm', 'lg', 'icon'] },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  args: { onClick: fn() },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>
/*
 *👇 Render functions are a framework specific feature to allow you control on how the component renders.
 * See https://storybook.js.org/docs/api/csf
 * to learn how to use render functions.
 */
export const Default: Story = {
  args: {
    variant: 'default',
    size: 'default',
    asChild: false,
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Button</Button>',
  }),
}

export const Destructive: Story = {
  args: {
    variant: 'destructive',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Button</Button>',
  }),
}

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
  render: (args) => ({
    components: { Button },
    setup() {
      return { args }
    },
    template: '<Button v-bind="args">Button</Button>',
  }),
}

export const Secondary: Story = {
    args: {
      variant: 'secondary',
    },
    render: (args) => ({
      components: { Button },
      setup() {
        return { args }
      },
      template: '<Button v-bind="args">Button</Button>',
    }),
  }

  export const Ghost: Story = {
    args: {
      variant: 'ghost',
    },
    render: (args) => ({
      components: { Button },
      setup() {
        return { args }
      },
      template: '<Button v-bind="args">Button</Button>',
    }),
  }

  export const Link: Story = {
    args: {
      variant: 'link',
    },
    render: (args) => ({
      components: { Button },
      setup() {
        return { args }
      },
      template: '<Button v-bind="args">Button</Button>',
    }),
  }

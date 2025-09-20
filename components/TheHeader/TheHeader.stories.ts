import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import TheHeader from './TheHeader.vue'

const meta = {
  title: 'components/TheHeader',
  component: TheHeader,
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
} satisfies Meta<typeof TheHeader>

export default meta
type Story = StoryObj<typeof meta>

export const LoggedOut: Story = {
  args: {},
}

export const LoggedIn: Story = {
  args: {},
  parameters: {
    // Mock the useSupabaseUser composable for this story
    useSupabaseUser: () => ref({ id: '123', email: 'user@example.com' }),
  },
}

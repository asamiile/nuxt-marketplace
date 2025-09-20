import type { Meta, StoryObj } from '@storybook/vue3'
import UserListings from './UserListings.vue'
import { ref } from 'vue'

const meta = {
  title: 'components/dashboard/UserListings',
  component: UserListings,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof UserListings>

export default meta
type Story = StoryObj<typeof meta>

const mockProducts = [
  { id: 1, name: 'Product A', price: 1000, status: 'approved', image_url: 'https://placehold.co/100x100' },
  { id: 2, name: 'Product B', price: 2500, status: 'pending', image_url: 'https://placehold.co/100x100' },
  { id: 3, name: 'Product C', price: 500, status: 'rejected', image_url: 'https://placehold.co/100x100' },
  { id: 4, name: 'Product D', price: 1500, status: 'banned', image_url: 'https://placehold.co/100x100' },
]

export const Default: Story = {
  args: {},
  parameters: {
    useAsyncData: () => ({
      data: ref(mockProducts),
      pending: ref(false),
      error: ref(null),
    }),
  },
}

export const Loading: Story = {
  args: {},
  parameters: {
    useAsyncData: () => ({
      data: ref([]),
      pending: ref(true),
      error: ref(null),
    }),
  },
}

export const Empty: Story = {
  args: {},
  parameters: {
    useAsyncData: () => ({
      data: ref([]),
      pending: ref(false),
      error: ref(null),
    }),
  },
}

export const WithError: Story = {
  args: {},
  parameters: {
    useAsyncData: () => ({
      data: ref([]),
      pending: ref(false),
      error: ref(new Error('Failed to fetch user listings.')),
    }),
  },
}

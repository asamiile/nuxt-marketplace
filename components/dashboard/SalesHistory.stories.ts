import type { Meta, StoryObj } from '@storybook/vue3'
import SalesHistory from './SalesHistory.vue'
import { ref } from 'vue'

const meta = {
  title: 'components/dashboard/SalesHistory',
  component: SalesHistory,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof SalesHistory>

export default meta
type Story = StoryObj<typeof meta>

const mockSales = [
  { product_id: 1, product_name: 'Product A', price: 1000, purchased_at: '2023-10-26T10:00:00Z', purchaser_username: 'user1' },
  { product_id: 2, product_name: 'Product B', price: 2500, purchased_at: '2023-10-25T14:30:00Z', purchaser_username: 'user2' },
  { product_id: 3, product_name: 'Product C', price: 500, purchased_at: '2023-10-25T11:00:00Z', purchaser_username: 'user3' },
]

export const Default: Story = {
  args: {},
  parameters: {
    useAsyncData: () => ({
      data: ref(mockSales),
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
        error: ref(new Error('Failed to fetch sales history.')),
      }),
    },
  }

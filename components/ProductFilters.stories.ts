import type { Meta, StoryObj } from '@storybook/vue3'
import ProductFilters from './ProductFilters.vue'
import type { Category, Tag } from '~/types/product'

const meta = {
  title: 'components/ProductFilters',
  component: ProductFilters,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ProductFilters>

export default meta
type Story = StoryObj<typeof meta>

const mockCategories: Category[] = [
  { id: 1, name: 'Category 1', created_at: new Date().toISOString() },
  { id: 2, name: 'Category 2', created_at: new Date().toISOString() },
  { id: 3, name: 'Category 3', created_at: new Date().toISOString() },
]

const mockTags: Tag[] = [
  { id: 1, name: 'Tag 1', created_at: new Date().toISOString() },
  { id: 2, name: 'Tag 2', created_at: new Date().toISOString() },
  { id: 3, name: 'Tag 3', created_at: new Date().toISOString() },
  { id: 4, name: 'Tag 4', created_at: new Date().toISOString() },
  { id: 5, name: 'Tag 5', created_at: new Date().toISOString() },
]

export const Default: Story = {
  args: {
    categories: mockCategories,
    tags: mockTags,
  },
}

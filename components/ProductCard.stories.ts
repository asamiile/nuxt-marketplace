import type { Meta, StoryObj } from '@storybook/vue3'
import ProductCard from './ProductCard.vue'
import type { Product } from '~/types/product'

const meta = {
  title: 'components/ProductCard',
  component: ProductCard,
  tags: ['autodocs'],
  argTypes: {},
} satisfies Meta<typeof ProductCard>

export default meta
type Story = StoryObj<typeof meta>

const mockProduct: Product = {
  id: 1,
  created_at: new Date().toISOString(),
  name: 'Sample Product',
  description: 'This is a sample product.',
  price: 19.99,
  image_url: 'https://placehold.co/300x300',
  file_url: null,
  creator_id: '123-abc',
  category_id: 1,
  license_type: 'Standard',
  terms_of_use: null,
  status: 'approved',
  admin_notes: null,
  profiles: {
    username: 'testuser',
    avatar_url: null,
  },
}

export const Default: Story = {
  args: {
    product: mockProduct,
  },
}

export const WithoutProfile: Story = {
    args: {
      product: {
        ...mockProduct,
        profiles: null,
      },
    },
  }

export const Loading: Story = {
    args: {
        product: {
            ...mockProduct,
            name: 'Loading Product...',
            profiles: {
                username: 'loading...',
                avatar_url: null,
            }
        }
    },
    render: (args) => ({
        components: { ProductCard },
        setup() {
          return { args }
        },
        template: `
        <div class="animate-pulse">
            <ProductCard v-bind="args" />
        </div>
        `,
      }),
}

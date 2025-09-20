import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ProductCard from '@/components/ProductCard/ProductCard.vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { Product } from '~/types/product'
import HeartIcon from '@/components/icons/HeartIcon.vue'
import HeartIconSolid from '@/components/icons/HeartIconSolid.vue'

// --- Mock Composables ---
const isFavoritedStateRef = ref(false)
const toggleFavoriteMock = vi.fn()
const { useProductFavoriteMock } = vi.hoisted(() => {
  return {
    useProductFavoriteMock: () => ({
      isFavoritedState: isFavoritedStateRef,
      toggleFavorite: toggleFavoriteMock,
    }),
  }
})
mockNuxtImport('useProductFavorite', () => useProductFavoriteMock)

const { useFormattersMock } = vi.hoisted(() => ({
  useFormattersMock: () => ({
    formatPrice: (price: number) => `$${price.toFixed(2)}`,
  }),
}))
mockNuxtImport('useFormatters', () => useFormattersMock)

const { pushMock, useRouterMock } = vi.hoisted(() => {
    const pushMock = vi.fn()
    return {
        pushMock,
        useRouterMock: () => ({
            push: pushMock
        })
    }
})
mockNuxtImport('useRouter', () => useRouterMock)

const { getOptimizedPublicUrlMock, useSupabaseHelpersMock } = vi.hoisted(() => ({
    getOptimizedPublicUrlMock: vi.fn((path) => `http://example.com/optimized/${path}`),
    useSupabaseHelpersMock: () => ({
        getPathFromUrl: (url: string) => url.includes('supabase') ? 'path/to/image.png' : null,
        getOptimizedPublicUrl: getOptimizedPublicUrlMock
    })
}))
mockNuxtImport('useSupabaseHelpers', () => useSupabaseHelpersMock)
// --- End Mocks ---

const mockProduct: Product = {
  id: 1,
  name: 'Test Product',
  price: 99.99,
  description: 'A product for testing',
  image_url: 'https://example.com/supabase/path/to/image.png',
  profiles: {
    username: 'testuser'
  }
}

describe('ProductCard.vue', () => {
    const mountOptions = {
        props: { product: mockProduct },
        global: {
            stubs: {
                NuxtLink: {
                    template: '<a :href="to"><slot /></a>',
                    props: ['to']
                }
            },
            components: {
                HeartIcon,
                HeartIconSolid
            }
        }
    }

    beforeEach(() => {
        vi.clearAllMocks()
        isFavoritedStateRef.value = false
    })

    it('renders product information correctly', () => {
        const wrapper = mount(ProductCard, mountOptions)

        const text = wrapper.text()
        expect(text).toContain('Test Product')
        expect(text).toContain('$99.99') // From mocked useFormatters
        expect(text).toContain('testuser')

        const img = wrapper.find('img')
        expect(img.attributes('src')).toBe('http://example.com/optimized/path/to/image.png')
    })

    it('shows outline heart icon when not favorited', () => {
        isFavoritedStateRef.value = false
        const wrapper = mount(ProductCard, mountOptions)
        expect(wrapper.find('[data-testid="outline-heart"]').exists()).toBe(true)
        expect(wrapper.find('[data-testid="solid-heart"]').exists()).toBe(false)
    })

    it('shows solid heart icon when favorited', () => {
        isFavoritedStateRef.value = true
        const wrapper = mount(ProductCard, mountOptions)
        expect(wrapper.find('[data-testid="outline-heart"]').exists()).toBe(false)
        expect(wrapper.find('[data-testid="solid-heart"]').exists()).toBe(true)
    })

    it('calls toggleFavorite when favorite button is clicked', async () => {
        const wrapper = mount(ProductCard, mountOptions)
        const favoriteButton = wrapper.find('button[aria-label="Toggle Favorite"]')
        await favoriteButton.trigger('click')
        expect(toggleFavoriteMock).toHaveBeenCalledTimes(1)
    })

    it('navigates to product page on card click', async () => {
        const wrapper = mount(ProductCard, mountOptions)
        await wrapper.find('[data-slot="card"]').trigger('click')
        expect(pushMock).toHaveBeenCalledWith('/product/1')
    })
})

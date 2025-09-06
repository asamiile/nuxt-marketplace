<template>
  <UiCard @click="navigateToProduct" class="overflow-hidden hover:shadow-xl transition-all duration-300 relative cursor-pointer hover:scale-105">
    <img :src="optimizedImageUrl" alt="Product image" class="w-full h-48 object-cover">
    <UiCardContent class="p-4">
      <UiCardTitle class="text-lg truncate">{{ product.name }}</UiCardTitle>
      <NuxtLink v-if="product.profiles?.username" :to="`/creator/${product.profiles.username}`" @click.stop class="text-sm text-muted-foreground hover:text-primary transition-colors">
        {{ product.profiles.username }}
      </NuxtLink>
      <p v-else class="text-sm text-muted-foreground">Unknown Creator</p>
      <p class="font-semibold mt-2">{{ formatPrice(product.price) }}</p>
    </UiCardContent>
    <button
      @click.prevent.stop="toggleFavorite"
      class="absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors z-10"
      aria-label="Toggle Favorite"
    >
      <span :class="{'text-red-500': isFavoritedState, 'text-gray-300': !isFavoritedState}">❤️</span>
    </button>
  </UiCard>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

interface ProductCardProps {
  product: Product;
}

const props = defineProps<ProductCardProps>()
const router = useRouter()

const { isFavoritedState, toggleFavorite } = useProductFavorite(props.product.id)

const navigateToProduct = () => {
  router.push(`/product/${props.product.id}`)
}

const formatPrice = (price: number | null) => {
  if (price === null) return ''
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
}

const { getPathFromUrl, getOptimizedPublicUrl } = useSupabaseHelpers()

// 最適化された画像URLを生成する算出プロパティ
const optimizedImageUrl = computed(() => {
  const path = getPathFromUrl(props.product.image_url)
  return getOptimizedPublicUrl(path, { width: 300, height: 300 })
})
</script>

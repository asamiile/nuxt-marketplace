<template>
  <Card @click="navigateToProduct" class="overflow-hidden transition-all duration-400 relative cursor-pointer">
    <CardHeader>
      <img :src="optimizedImageUrl" alt="Product image" class="w-full h-48 object-cover">
    </CardHeader>
    <CardContent>
      <CardTitle class="text-lg truncate">{{ product.name }}</CardTitle>
      <NuxtLink v-if="product.profiles?.username" :to="`/creator/${product.profiles.username}`" @click.stop class="text-sm text-muted-foreground hover:text-sky-500 transition-colors">
        {{ product.profiles.username }}
      </NuxtLink>
      <p v-else class="text-sm text-muted-foreground">Unknown Creator</p>
      <p class="font-semibold mt-2">{{ formatPrice(product.price) }}</p>
    </CardContent>
    <button
      @click.prevent.stop="toggleFavorite"
      class="absolute top-2 right-2 z-10 p-2 rounded-full hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-colors duration-200"
      aria-label="Toggle Favorite"
    >
      <HeartIconSolid v-if="isFavoritedState" class="w-6 h-6 text-red-400" />
      <HeartIcon v-else class="w-6 h-6 text-gray-400 dark:text-gray-300" />
    </button>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import type { Product } from '~/types/product'
import HeartIcon from '~/components/icons/HeartIcon.vue'
import HeartIconSolid from '~/components/icons/HeartIconSolid.vue'

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
  const imageUrl = props.product.image_url
  if (!imageUrl) {
    return 'https://placehold.co/300x300'
  }
  // Use the robust getPathFromUrl to check if it's a Supabase URL
  const path = getPathFromUrl(imageUrl)

  // If path is null, it's likely an external URL (like the seed data)
  if (!path) {
    return imageUrl
  }

  // Otherwise, get the optimized URL
  return getOptimizedPublicUrl(path, { width: 300, height: 300, resize: 'contain' })
})
</script>

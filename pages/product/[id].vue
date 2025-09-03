<template>
  <div class="container">
    <div v-if="pending">
      <p>商品を読み込んでいます...</p>
    </div>
    <div v-else-if="error || !product" class="text-center">
      <h1 class="text-2xl font-bold">商品が見つかりません</h1>
      <p class="mt-4">お探しの商品は存在しないか、移動された可能性があります。</p>
      <NuxtLink to="/" :class="buttonVariants({ class: 'mt-6' })">
        ホームに戻る
      </NuxtLink>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      <div>
        <img :src="product.image_url" :alt="product.name" class="w-full rounded-lg shadow-lg">
      </div>
      <div>
        <h1 class="text-3xl lg:text-4xl font-bold mb-2 text-foreground">{{ product.name }}</h1>
        <p class="text-lg text-foreground mb-4">
          作成者:
          <NuxtLink v-if="product.profiles?.username" :to="`/creator/${product.profiles.username}`" class="font-semibold hover:text-primary transition-colors">
            {{ product.profiles.username }}
          </NuxtLink>
          <span v-else class="font-semibold">N/A</span>
        </p>
        <p class="text-3xl font-bold text-foreground mb-6">{{ formatPrice(product.price) }}</p>
        <p class="text-foreground mb-8 whitespace-pre-wrap">{{ product.description }}</p>
        <div class="flex items-center gap-4">
          <UiButton class="flex-grow" size="lg">
            購入する
          </UiButton>
          <button
            @click="toggleFavorite"
            class="p-4 rounded-md bg-card border border-border hover:bg-muted"
            aria-label="Toggle Favorite"
          >
            <span :class="{'text-red-500': isFavoritedState, 'text-gray-400': !isFavoritedState}" class="text-2xl">❤️</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Product } from '~/types/product'
import { useFavorites } from '~/composables/useFavorites'
import { buttonVariants } from '~/components/ui/buttonVariants'

const route = useRoute()
const supabase = useSupabaseClient()
const user = useCurrentUser()
const id = route.params.id

const { isFavorited, addFavorite, removeFavorite } = useFavorites()
const isFavoritedState = ref(false)

const { data: product, pending, error } = await useAsyncData<Product | null>(`product-${id}`, async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles (
        username
      )
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error(`Error fetching product ${id}:`, error)
    throw error
  }

  return data
})

if (!pending.value && !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product Not Found', fatal: true })
}

const formatPrice = (price: number | null) => {
  if (price === null) return ''
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
}

useHead({
  title: product.value?.name || '商品詳細',
  meta: [
    { name: 'description', content: product.value?.description || '商品の詳細ページです。' }
  ]
})

onMounted(async () => {
  if (user.value && product.value) {
    isFavoritedState.value = await isFavorited(product.value.id)
  }
})

const toggleFavorite = async () => {
  if (!user.value) {
    alert('Please log in to favorite items.')
    return
  }
  if (!product.value) return

  isFavoritedState.value = !isFavoritedState.value
  if (isFavoritedState.value) {
    await addFavorite(product.value.id)
  } else {
    await removeFavorite(product.value.id)
  }
}
</script>

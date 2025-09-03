<template>
  <div>
    <div v-if="pending">
      <p>商品を読み込んでいます...</p>
    </div>
    <div v-else-if="error || !product" class="text-center">
      <h1 class="text-2xl font-bold">商品が見つかりません</h1>
      <p class="mt-4">お探しの商品は存在しないか、移動された可能性があります。</p>
      <NuxtLink to="/" class="mt-6 inline-block px-6 py-3 text-white rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
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
          作成者: <span class="font-semibold">{{ product.profiles?.username || 'N/A' }}</span>
        </p>
        <p class="text-3xl font-bold text-foreground mb-6">{{ formatPrice(product.price) }}</p>
        <p class="text-foreground mb-8 whitespace-pre-wrap">{{ product.description }}</p>
        <button class="w-full px-8 py-4 text-lg font-bold text-white rounded-md bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
          購入する
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

const route = useRoute()
const supabase = useSupabaseClient()
const id = route.params.id

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
    // This will not throw an error if the item is not found, Supabase returns null.
    // It will only throw for actual database errors.
    console.error(`Error fetching product ${id}:`, error)
    throw error
  }

  return data
})

// If the product is not found after fetching, show a 404 error page.
if (!pending.value && !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product Not Found', fatal: true })
}

const formatPrice = (price: number | null) => {
  if (price === null) return ''
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
}

// Set page metadata
useHead({
  title: product.value?.name || '商品詳細',
  meta: [
    { name: 'description', content: product.value?.description || '商品の詳細ページです。' }
  ]
})
</script>

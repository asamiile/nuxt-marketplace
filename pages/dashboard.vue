<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-primary">マイダッシュボード</h1>
      <NuxtLink to="/sell" class="px-4 py-2 text-sm font-medium text-white rounded-md bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
        新しい商品を出品する
      </NuxtLink>
    </div>

    <div v-if="pending">
      <p>読み込み中...</p>
    </div>
    <div v-else-if="error">
      <p>エラーが発生しました: {{ error.message }}</p>
    </div>
    <div v-else-if="products && products.length > 0">
      <h2 class="text-xl font-semibold mb-4 text-primary">あなたの出品商品</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
    </div>
    <div v-else class="text-center py-12 bg-gray-50 rounded-lg">
      <h2 class="text-xl font-semibold text-primary">商品はまだありません。</h2>
      <p class="mt-2 text-primary">最初の商品を出品して、販売を始めましょう！</p>
      <NuxtLink to="/sell" class="mt-6 inline-block px-6 py-3 text-white rounded-md bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
        出品ページへ
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useCurrentUser()

const { data: products, pending, error } = await useAsyncData<Product[]>(
  `user-products-${user.value?.id}`,
  async () => {
    if (!user.value) return []

    const { data, error } = await supabase
      .from('products')
      .select(`
        id,
        name,
        price,
        image_url,
        profiles (
          username
        )
      `)
      .eq('creator_id', user.value.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching user products:', error)
      throw error
    }

    return data as Product[]
  },
  {
    watch: [user] // Re-fetch if the user changes
  }
)
</script>

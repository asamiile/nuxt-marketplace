<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">商品一覧</h1>

    <div v-if="pending">
      <p>読み込み中...</p>
    </div>
    <div v-else-if="error">
      <p>エラーが発生しました: {{ error.message }}</p>
    </div>
    <div v-else-if="products && products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
    <div v-else>
      <p>商品はまだありません。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

const supabase = useSupabaseClient()

const { data: products, pending, error } = await useAsyncData<Product[]>('products', async () => {
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
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }

  // The data from Supabase needs to be cast to the Product type.
  // The select query is structured to match the Product type.
  return data as Product[]
})
</script>

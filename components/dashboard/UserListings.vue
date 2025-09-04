<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold text-foreground">あなたの出品商品</h2>
      <NuxtLink to="/sell" :class="buttonVariants()">
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
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
    </div>
    <div v-else class="text-center py-12 bg-secondary rounded-lg">
      <h2 class="text-xl font-semibold text-foreground">商品はまだありません。</h2>
      <p class="mt-2 text-foreground">最初の商品を出品して、販売を始めましょう！</p>
      <NuxtLink to="/sell" :class="buttonVariants({ class: 'mt-6' })">
        出品ページへ
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'
import { buttonVariants } from '~/components/ui/buttonVariants'
import ProductCard from '~/components/ProductCard.vue'

const supabase = useSupabaseClient()
const user = useCurrentUser()

// Fetch user's own products for sale
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
    watch: [user]
  }
)
</script>

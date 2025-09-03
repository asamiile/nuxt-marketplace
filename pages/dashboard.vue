<template>
  <div class="container py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-foreground">マイダッシュボード</h1>
      <NuxtLink to="/sell" :class="buttonVariants()">
        新しい商品を出品する
      </NuxtLink>
    </div>

    <!-- Favorite Products Section -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-4 text-foreground">お気に入り商品</h2>
      <div v-if="favoritesLoading">
        <p>お気に入りを読み込んでいます...</p>
      </div>
      <div v-else-if="favoriteProducts && favoriteProducts.length > 0">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard v-for="product in favoriteProducts" :key="`fav-${product.id}`" :product="product" />
        </div>
      </div>
      <div v-else class="text-center py-10 bg-secondary rounded-lg">
        <p class="text-foreground">お気に入りに登録した商品はまだありません。</p>
      </div>
    </div>

    <div class="border-t border-border pt-8">
      <h2 class="text-2xl font-semibold mb-4 text-foreground">あなたの出品商品</h2>
      <div v-if="pending">
        <p>読み込み中...</p>
      </div>
      <div v-else-if="error">
        <p>エラーが発生しました: {{ error.message }}</p>
      </div>
      <div v-else-if="products && products.length > 0">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import type { Product } from '~/types/product'
import { useFavorites } from '~/composables/useFavorites'
import { buttonVariants } from '~/components/ui/buttonVariants'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useCurrentUser()

// Fetch favorite products
const { favorites: favoriteProducts, loading: favoritesLoading, fetchFavoriteProducts } = useFavorites()

onMounted(() => {
  fetchFavoriteProducts()
})

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
    watch: [user] // Re-fetch if the user changes
  }
)
</script>

<template>
  <div class="mb-12">
    <h2 class="text-2xl font-semibold mb-4 text-foreground">お気に入り商品</h2>
    <div v-if="favoritesLoading">
      <p>お気に入りを読み込んでいます...</p>
    </div>
    <div v-else-if="favoriteProducts && favoriteProducts.length > 0">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProductCard v-for="product in favoriteProducts" :key="`fav-${product.id}`" :product="product" />
      </div>
    </div>
    <div v-else class="text-center py-10 bg-secondary rounded-lg">
      <p class="text-foreground">お気に入りに登録した商品はまだありません。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue'
import { useFavorites } from '~/composables/useFavorites'
import ProductCard from '~/components/ProductCard.vue'

const { showAlert } = useAlert()

// Fetch favorite products
const { favorites: favoriteProducts, loading: favoritesLoading, error, fetchFavoriteProducts } = useFavorites()

onMounted(() => {
  fetchFavoriteProducts()
})

watch(error, (newError) => {
  if (newError) {
    showAlert('エラー', `お気に入り商品の読み込みに失敗しました: ${newError.message}`, 'error')
  }
})
</script>

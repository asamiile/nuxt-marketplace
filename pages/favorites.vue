<template>
  <div class="container py-8">
    <h1 class="text-3xl font-bold mb-8">お気に入り商品</h1>

    <div v-if="loading">
      <p>お気に入りを読み込んでいます...</p>
    </div>
    <div v-else-if="favorites && favorites.length > 0">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
        <ProductCard v-for="product in favorites" :key="`fav-${product.id}`" :product="product" />
      </div>
      <div class="mt-8">
        <Pagination
          v-if="totalPages > 1"
          v-model:currentPage="currentPage"
          :total-pages="totalPages"
        />
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
import Pagination from '~/components/ui/Pagination.vue'
import { useAlert } from '~/composables/useAlert'

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'お気に入り商品',
})

const { showAlert } = useAlert()

// Fetch favorite products
const {
  favorites,
  loading,
  error,
  currentPage,
  totalPages,
  fetchFavoriteProducts
} = useFavorites()

onMounted(() => {
  fetchFavoriteProducts()
})

watch(currentPage, () => {
  fetchFavoriteProducts()
})

watch(error, (newError) => {
  if (newError) {
    showAlert('エラー', `お気に入り商品の読み込みに失敗しました: ${newError.message}`, 'error')
  }
})
</script>

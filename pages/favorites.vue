<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">お気に入り商品</h1>

    <div v-if="loading">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        <Skeleton v-for="n in 8" :key="n" />
      </div>
    </div>
    <div v-else-if="favorites && favorites.length > 0">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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
import { useAlert } from '~/composables/useAlert'

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'お気に入り商品',
})

const { showToast } = useAlert()

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
    showToast('エラー', `お気に入り商品の読み込みに失敗しました: ${newError.message}`, 'error')
  }
})
</script>

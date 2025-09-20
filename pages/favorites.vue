<template>
  <div>
    <h1 class="text-3xl font-bold mb-8">お気に入り商品</h1>

    <div v-if="loading">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        <div v-for="n in 8" :key="n" class="space-y-2">
          <Skeleton class="h-48 w-full" />
          <Skeleton class="h-6 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
          <Skeleton class="h-6 w-1/4 mt-2" />
        </div>
      </div>
    </div>
    <div v-else-if="favorites && favorites.length > 0">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        <ProductCard v-for="product in favorites" :key="`fav-${product.id}`" :product="product" />
      </div>
      <div class="mt-8">
        <Pagination
          v-if="totalPages > 1"
          v-slot="{ page }"
          v-model:page="currentPage"
          :total="totalCount"
          :items-per-page="8"
          :sibling-count="1"
          show-edges
        >
          <PaginationContent v-slot="{ items }" class="flex items-center gap-1">
            <PaginationFirst />
            <PaginationPrevious />

            <template v-for="(item, index) in items">
              <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
                <Button class="w-9 h-9 p-0" :variant="item.value === page ? 'default' : 'outline'">
                  {{ item.value }}
                </Button>
              </PaginationItem>
              <PaginationEllipsis v-else :key="item.type" :index="index" />
            </template>

            <PaginationNext />
            <PaginationLast />
          </PaginationContent>
        </Pagination>
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
import ProductCard from '~/components/ProductCard'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
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
  totalCount,
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
    showToast({ title: 'エラー', description: `お気に入り商品の読み込みに失敗しました: ${newError.message}`, variant: 'error' })
  }
})
</script>

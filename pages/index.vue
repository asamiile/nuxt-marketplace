<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">商品一覧</h1>

    <div v-if="pending">
      <p>読み込み中...</p>
    </div>
    <div v-else-if="error">
      <p>エラーが発生しました: {{ error.message }}</p>
    </div>
    <div v-else-if="data && data.products && data.products.length > 0">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <ProductCard v-for="product in data.products" :key="product.id" :product="product" />
      </div>
      <div class="mt-8">
        <Pagination
          v-if="data.totalPages > 1"
          v-model:currentPage="currentPage"
          :total-pages="data.totalPages"
        />
      </div>
    </div>
    <div v-else>
      <p>商品はまだありません。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Product } from '~/types/product'
import Pagination from '~/components/ui/Pagination.vue'

const supabase = useSupabaseClient()
const itemsPerPage = 8
const currentPage = ref(1)

const { data, pending, error, refresh } = await useAsyncData(
  'products',
  async () => {
    // First, get the total count of products
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.error('Error fetching product count:', countError)
      throw countError
    }

    const totalPages = count ? Math.ceil(count / itemsPerPage) : 1

    // Then, fetch the products for the current page
    const from = (currentPage.value - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    const { data: productsData, error: productsError } = await supabase
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
      .range(from, to)

    if (productsError) {
      console.error('Error fetching products:', productsError)
      throw productsError
    }

    return {
      products: productsData as Product[],
      totalPages,
    }
  },
  {
    // By default, useAsyncData caches the result.
    // We set watch to an empty array to prevent this default behavior,
    // so that we can manually trigger a refresh.
    watch: [],
  },
)

watch(currentPage, () => {
  refresh()
})
</script>

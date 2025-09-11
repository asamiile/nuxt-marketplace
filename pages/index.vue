<template>
  <div>
    <ProductFilters
      v-if="categories && tags"
      :categories="categories"
      :tags="tags"
      @update:filters="updateFilters"
    />

    <div v-if="pending">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
        <Skeleton v-for="n in 8" :key="n" />
      </div>
    </div>
    <div v-else-if="error">
      <p>エラーが発生しました: {{ error.message }}</p>
    </div>
    <div v-else-if="data && data.products && data.products.length > 0">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8">
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
      <p>該当する商品は見つかりませんでした。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Product, Category, Tag } from '~/types/product'
import Pagination from '~/components/ui/Pagination.vue'
import Skeleton from '~/components/ui/Skeleton.vue'
import ProductFilters from '~/components/ProductFilters.vue'

const supabase = useSupabaseClient()
const itemsPerPage = 8
const currentPage = ref(1)

const filters = ref({
  keyword: '',
  categoryId: null,
  tagIds: [],
  minPrice: null,
  maxPrice: null,
})

const { data: categories } = await useAsyncData('categories', async () => {
  const { data } = await supabase.from('categories').select('*').eq('is_public', true).order('name')
  return data as Category[]
})

const { data: tags } = await useAsyncData('tags', async () => {
  const { data } = await supabase.from('tags').select('*').eq('is_public', true).order('name')
  return data as Tag[]
})

function updateFilters(newFilters: typeof filters.value) {
  filters.value = newFilters
  currentPage.value = 1 // Reset to first page when filters change
}

const { data, pending, error, refresh } = await useAsyncData(
  'products-filtered',
  async () => {
    const from = (currentPage.value - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    const rpcParams = {
      p_keyword: filters.value.keyword,
      p_category_id: filters.value.categoryId,
      p_tag_ids: filters.value.tagIds,
      p_min_price: filters.value.minPrice,
      p_max_price: filters.value.maxPrice,
    }

    // Fetch total count
    const { data: countData, error: countError } = await supabase.rpc('count_search_products', rpcParams)
    if (countError) {
      console.error('Error fetching product count:', countError)
      throw countError
    }
    const totalCount = countData as number

    // Fetch products for the current page
    const { data: productsData, error: productsError } = await supabase.rpc('search_products', rpcParams)
      .range(from, to)

    if (productsError) {
      console.error('Error fetching products:', productsError)
      throw productsError
    }

    const totalPages = totalCount > 0 ? Math.ceil(totalCount / itemsPerPage) : 1
    if (currentPage.value > totalPages) {
      currentPage.value = 1
    }

    return {
      products: productsData as Product[],
      totalPages,
    }
  },
  {
    watch: [() => ({ ...filters.value }), currentPage],
  },
)
</script>

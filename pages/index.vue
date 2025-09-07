<template>
  <div>
    <ProductFilters
      v-if="categories"
      :categories="categories"
      @update:filters="updateFilters"
    />

    <div v-if="pending">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <Skeleton v-for="n in 8" :key="n" />
      </div>
    </div>
    <div v-else-if="error">
      <p>エラーが発生しました: {{ error.message }}</p>
    </div>
    <div v-else-if="data && data.products && data.products.length > 0">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
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
import type { Product, Category } from '~/types/product'
import Pagination from '~/components/ui/Pagination.vue'
import Skeleton from '~/components/ui/Skeleton.vue'
import ProductFilters from '~/components/ProductFilters.vue'

const supabase = useSupabaseClient()
const itemsPerPage = 8
const currentPage = ref(1)

const filters = ref({
  keyword: '',
  categoryId: null,
  minPrice: null,
  maxPrice: null,
})

const { data: categories } = await useAsyncData('categories', async () => {
  const { data } = await supabase.from('categories').select('*').order('name')
  return data as Category[]
})

function updateFilters(newFilters: typeof filters.value) {
  filters.value = newFilters
}

const { data, pending, error, refresh } = await useAsyncData(
  'products-filtered',
  async () => {
    let query = supabase.from('products').select(
      `
        id,
        name,
        price,
        image_url,
        profiles (
          username
        )
      `,
      { count: 'exact' },
    )

    if (filters.value.keyword) {
      query = query.ilike('name', `%${filters.value.keyword}%`)
    }
    if (filters.value.categoryId) {
      query = query.eq('category_id', filters.value.categoryId)
    }
    if (filters.value.minPrice) {
      query = query.gte('price', filters.value.minPrice)
    }
    if (filters.value.maxPrice) {
      query = query.lte('price', filters.value.maxPrice)
    }

    // First, get the total count of filtered products
    const { count, error: countError } = await query

    if (countError) {
      console.error('Error fetching product count:', countError)
      throw countError
    }

    const totalPages = count ? Math.ceil(count / itemsPerPage) : 1
    // Reset to page 1 if current page is out of bounds
    if (currentPage.value > totalPages) {
      currentPage.value = 1
    }

    // Then, fetch the products for the current page
    const from = (currentPage.value - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    const { data: productsData, error: productsError } = await query
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
    watch: [filters, currentPage],
  },
)
</script>

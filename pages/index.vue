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
        <div v-for="n in 8" :key="n" class="space-y-2">
          <Skeleton class="h-48 w-full" />
          <Skeleton class="h-6 w-3/4" />
          <Skeleton class="h-4 w-1/2" />
          <Skeleton class="h-6 w-1/4 mt-2" />
        </div>
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
          v-slot="{ page }"
          v-model:page="currentPage"
          :total="data.totalCount"
          :items-per-page="itemsPerPage"
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
    <div v-else>
      <p>該当する商品は見つかりませんでした。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Product, Category, Tag } from '~/types/product'
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
import ProductFilters from '~/components/ProductFilters'
import ProductCard from '~/components/ProductCard'

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

    const { data: productsData, error: productsError } = await supabase.rpc('search_products', rpcParams)
      .range(from, to)

    if (productsError) {
      console.error('Error fetching products:', productsError)
      throw productsError
    }

    const totalCount = productsData.length > 0 ? productsData[0].total_count : 0
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / itemsPerPage) : 1

    if (currentPage.value > totalPages) {
      currentPage.value = 1
    }

    return {
      products: productsData as Product[],
      totalPages,
      totalCount,
    }
  },
  {
    watch: [filters, currentPage],
    deep: true,
  },
)
</script>

<script setup lang="ts">
import { ref, computed } from 'vue'
import UiPagination from '~/components/ui/Pagination.vue'
import type { Product } from '~/types/product'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { showToast } = useAlert()

const { data: products, pending, error, refresh } = await useFetch<Product[]>('/api/admin/products', {
  onResponseError: ({ response }) => {
    console.error(response._data)
    showToast({
      title: 'エラー',
      description: '商品情報の取得に失敗しました。',
      variant: 'destructive',
    })
  },
  default: () => [],
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => {
  if (!products.value) return 1
  return Math.ceil(products.value.length / itemsPerPage)
})

const paginatedProducts = computed(() => {
  if (!products.value) return []
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return products.value.slice(startIndex, startIndex + itemsPerPage)
})

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('ja-JP')
}

const translateStatus = (status: string | null) => {
  switch (status) {
    case 'pending':
      return '承認待ち'
    case 'approved':
      return '承認済み'
    case 'rejected':
      return '要修正'
    case 'banned':
      return '却下'
    default:
      return '不明'
  }
}

const statusBadgeClass = (status: string | null) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'approved':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'rejected':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'banned':
      return 'bg-gray-500 text-white dark:bg-gray-700 dark:text-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-300'
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">
      商品一覧
    </h1>
    <div class="bg-white dark:bg-gray-800 rounded-lg overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              ID
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              商品名
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              ステータス
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              価格
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              クリエイター
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              登録日時
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
          <tr v-if="pending">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">読み込み中...</td>
          </tr>
          <tr v-else-if="error || !paginatedProducts || paginatedProducts.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              商品が見つかりません。
            </td>
          </tr>
          <tr v-for="product in paginatedProducts" :key="product.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <NuxtLink :to="`/admin/products/${product.id}`" class="text-blue-600 hover:underline dark:text-blue-400">
                {{ product.id }}
              </NuxtLink>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {{ product.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="statusBadgeClass(product.status)"
              >
                {{ translateStatus(product.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              ¥{{ product.price.toLocaleString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ product.profiles?.username || 'N/A' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(product.created_at) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="mt-6 flex justify-center">
      <UiPagination
        v-model:currentPage="currentPage"
        :total-pages="totalPages"
      />
    </div>
  </div>
</template>

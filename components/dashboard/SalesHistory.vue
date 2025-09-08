<template>
  <div>
    <div class="mb-4">
      <h2 class="text-2xl font-semibold text-foreground mb-3">販売管理</h2>
      <p class="text-muted-foreground">商品の売上履歴とサマリーを確認します。</p>
    </div>
    <UiCard>
      <UiCardContent class="p-8">
        <div class="grid grid-cols-2 gap-4 text-center mb-8">
          <div class="p-4 bg-secondary rounded-lg">
            <p class="text-sm text-muted-foreground">合計売上 (全期間)</p>
            <p class="text-2xl font-bold">{{ formatPrice(totalSales) }}</p>
          </div>
          <div class="p-4 bg-secondary rounded-lg">
            <p class="text-sm text-muted-foreground">販売数 (全期間)</p>
            <p class="text-2xl font-bold">{{ sales ? sales.length : 0 }} 件</p>
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">販売履歴</h3>
            <div class="w-72">
              <UiInput v-model="searchQuery" type="text" placeholder="商品名または購入者名で検索..." />
            </div>
          </div>
          <div v-if="pending" class="text-center py-8">
            <p>履歴を読み込んでいます...</p>
          </div>
          <div v-else-if="error" class="text-center text-destructive py-8">
            <p>履歴の読み込み中にエラーが発生しました。</p>
          </div>
          <div v-else-if="filteredAndPagedSales.length > 0">
            <div class="border rounded-lg overflow-hidden">
              <table class="min-w-full divide-y divide-border">
                <thead class="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th class="px-4 py-2 text-left text-sm font-medium text-muted-foreground">商品名</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-muted-foreground">購入者</th>
                    <th class="px-4 py-2 text-left text-sm font-medium text-muted-foreground">販売日時</th>
                    <th class="px-4 py-2 text-right text-sm font-medium text-muted-foreground">価格</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr v-for="sale in filteredAndPagedSales" :key="sale.product_id + sale.purchased_at">
                    <td class="px-4 py-2 font-medium">
                      <NuxtLink :to="`/product/${sale.product_id}`" class="hover:underline">
                        {{ sale.product_name }}
                      </NuxtLink>
                    </td>
                    <td class="px-4 py-2 text-muted-foreground">{{ sale.purchaser_username }}</td>
                    <td class="px-4 py-2 text-muted-foreground">{{ new Date(sale.purchased_at).toLocaleString() }}</td>
                    <td class="px-4 py-2 text-right">{{ formatPrice(sale.price) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="totalPages > 1" class="mt-4 flex justify-center">
              <UiPagination
                v-model:page="currentPage"
                :total="totalPages * itemsPerPage"
                :items-per-page="itemsPerPage"
                :sibling-count="1"
                show-edges
              />
            </div>
          </div>
          <div v-else class="text-center text-muted-foreground py-8">
            <p>該当する販売履歴がありません。</p>
          </div>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import UiInput from '~/components/ui/form/Input.vue'
import UiPagination from '~/components/ui/Pagination.vue'

const supabase = useSupabaseClient()
const { showToast } = useAlert()

interface Sale {
  product_id: number;
  product_name: string;
  price: number;
  purchased_at: string;
  purchaser_username: string;
}

const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = 10

const { data: sales, pending, error } = await useAsyncData('sales-history', async () => {
  const { data, error } = await supabase.rpc('get_sales_history')
  if (error) {
    showToast('エラー', '販売履歴の読み込みに失敗しました。', 'error')
    return []
  }
  return data
}, {
  default: () => []
})

const filteredAndPagedSales = computed(() => {
  if (!sales.value) return []

  // 1. 絞り込み
  let filtered = sales.value
  if (searchQuery.value) {
    const lowerCaseQuery = searchQuery.value.toLowerCase()
    filtered = sales.value.filter(sale =>
      (sale.product_name && sale.product_name.toLowerCase().includes(lowerCaseQuery)) ||
      (sale.purchaser_username && sale.purchaser_username.toLowerCase().includes(lowerCaseQuery))
    )
  }

  // 2. ページネーション
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return filtered.slice(startIndex, startIndex + itemsPerPage)
})

const totalPages = computed(() => {
  if (!sales.value) return 1

  const totalItems = searchQuery.value
    ? sales.value.filter(sale =>
        (sale.product_name && sale.product_name.toLowerCase().includes(searchQuery.value.toLowerCase())) ||
        (sale.purchaser_username && sale.purchaser_username.toLowerCase().includes(searchQuery.value.toLowerCase()))
      ).length
    : sales.value.length

  return Math.ceil(totalItems / itemsPerPage)
})

const totalSales = computed(() => {
  if (!sales.value) return 0
  return sales.value.reduce((sum, sale) => sum + sale.price, 0)
})

const formatPrice = (price: number | null) => {
  if (price === null) return 'N/A'
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
}

watch(searchQuery, () => {
  currentPage.value = 1
})
</script>

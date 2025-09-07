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
            <p class="text-sm text-muted-foreground">合計売上 (当ページ)</p>
            <p class="text-2xl font-bold">{{ formatPrice(totalSales) }}</p>
          </div>
          <div class="p-4 bg-secondary rounded-lg">
            <p class="text-sm text-muted-foreground">総販売数</p>
            <p class="text-2xl font-bold">{{ totalItems }} 件</p>
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold">販売履歴</h3>
            <div class="w-64">
              <UiInput v-model="searchTerm" type="text" placeholder="商品名で検索..." />
            </div>
          </div>
          <div v-if="pending" class="text-center"><p>履歴を読み込んでいます...</p></div>
          <div v-else-if="error" class="text-center text-destructive"><p>履歴の読み込み中にエラーが発生しました。</p></div>
          <div v-else-if="sales.length === 0" class="text-center text-muted-foreground py-8">
            <p>販売履歴がありません。</p>
          </div>
          <div v-else>
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
                  <tr v-for="sale in sales" :key="sale.product_id + sale.purchased_at">
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
            <div v-if="totalItems > itemsPerPage" class="mt-4 flex justify-center">
              <UiPagination
                v-model:page="currentPage"
                :items-per-page="itemsPerPage"
                :total="totalItems"
              />
            </div>
          </div>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import UiPagination from '~/components/ui/Pagination.vue'
import UiInput from '~/components/ui/form/Input.vue'

const supabase = useSupabaseClient()
const { showToast } = useAlert()

interface Sale {
  product_id: number;
  product_name: string;
  price: number;
  purchased_at: string;
  purchaser_username: string;
  total_count: number;
}

const sales = ref<Sale[]>([])
const pending = ref(true)
const error = ref<Error | null>(null)

const searchTerm = ref('')
const currentPage = ref(1)
const itemsPerPage = 5
const totalItems = ref(0)

const fetchSalesHistory = async () => {
  pending.value = true
  error.value = null
  try {
    const { data, error: rpcError } = await supabase.rpc('get_sales_history', {
      p_search_term: searchTerm.value || null,
      p_page: currentPage.value,
      p_page_size: itemsPerPage,
    })

    if (rpcError) throw rpcError

    sales.value = data || []
    if (data && data.length > 0) {
      totalItems.value = data[0].total_count
    } else {
      totalItems.value = 0
    }
  } catch (e: any) {
    error.value = e
    showToast('エラー', '販売履歴の読み込みに失敗しました。', 'error')
  } finally {
    pending.value = false
  }
}

const debouncedFetch = useDebounceFn(fetchSalesHistory, 300)

watch(searchTerm, () => {
  currentPage.value = 1
  debouncedFetch()
})

watch(currentPage, fetchSalesHistory)

// Initial fetch
fetchSalesHistory()

const totalSales = computed(() => {
  // Note: This now only calculates the total for the *current page*.
  // A separate RPC call would be needed for the grand total of all filtered sales.
  // For this implementation, we will stick to the current page total.
  return sales.value.reduce((sum, sale) => sum + sale.price, 0)
})

const formatPrice = (price: number | null) => {
  if (price === null) return 'N/A'
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
}
</script>

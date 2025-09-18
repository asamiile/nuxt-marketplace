<template>
  <div>
    <div class="mb-4">
      <h2 class="text-2xl font-semibold text-foreground mb-3">販売管理</h2>
      <p class="text-muted-foreground">商品の売上履歴とサマリーを確認します。</p>
    </div>
    <Card>
      <CardContent class="p-4 md:p-8">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center mb-8">
          <div class="p-4 bg-secondary rounded-lg">
            <p class="text-sm text-muted-foreground">合計売上 ({{ periodLabel }})</p>
            <p class="text-2xl font-bold">{{ formatPrice(totalSales) }}</p>
          </div>
          <div class="p-4 bg-secondary rounded-lg">
            <p class="text-sm text-muted-foreground">販売数 ({{ periodLabel }})</p>
            <p class="text-2xl font-bold">{{ sales ? sales.length : 0 }} 件</p>
          </div>
        </div>

        <div>
          <div class="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 mb-4">
            <h3 class="text-lg font-semibold">販売履歴</h3>
            <div class="flex flex-col md:flex-row gap-4">
               <div class="flex items-center gap-2">
                <DatePicker v-model="startDate" />
                <span>〜</span>
                <DatePicker v-model="endDate" />
              </div>
              <div class="flex gap-2">
                <Button variant="outline" size="sm" @click="setPeriod('this_month')">今月</Button>
                <Button variant="outline" size="sm" @click="setPeriod('this_year')">今年</Button>
                <Button variant="ghost" size="sm" @click="setPeriod(null)">リセット</Button>
              </div>
            </div>
          </div>
           <div class="flex flex-col xl:flex-row xl:justify-end xl:items-center gap-4 mb-4">
             <div class="w-full sm:w-72">
              <Input v-model="searchQuery" type="text" placeholder="商品名または購入者名で検索..." />
            </div>
           </div>
          <div v-if="pending" class="text-center py-4 md:py-8">
            <p>履歴を読み込んでいます...</p>
          </div>
          <div v-else-if="error" class="text-center text-destructive py-4 md:py-8">
            <p>履歴の読み込み中にエラーが発生しました。</p>
          </div>
          <div v-else-if="filteredAndPagedSales.length > 0">
            <div class="border rounded-lg overflow-x-auto">
              <table class="min-w-full divide-y divide-border">
                <thead class="bg-secondary">
                  <tr>
                    <th class="px-6 py-4 text-left text-sm font-medium text-muted-foreground">商品名</th>
                    <th class="px-6 py-4 text-left text-sm font-medium text-muted-foreground">購入者</th>
                    <th class="px-6 py-4 text-left text-sm font-medium text-muted-foreground">販売日時</th>
                    <th class="px-6 py-4 text-right text-sm font-medium text-muted-foreground">価格</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr v-for="sale in filteredAndPagedSales" :key="sale.product_id + sale.purchased_at">
                    <td class="px-6 py-4 font-medium whitespace-nowrap">
                      <NuxtLink :to="`/product/${sale.product_id}`" class="hover:underline text-sky-500">
                        {{ sale.product_name }}
                      </NuxtLink>
                    </td>
                    <td class="px-6 py-4 text-muted-foreground whitespace-nowrap">{{ sale.purchaser_username }}</td>
                    <td class="px-6 py-4 text-muted-foreground whitespace-nowrap">{{ formatDate(sale.purchased_at) }}</td>
                    <td class="px-6 py-4 text-right whitespace-nowrap">{{ formatPrice(sale.price) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-if="totalPages > 1" class="mt-4 flex justify-center">
              <UiPagination
                v-model:currentPage="currentPage"
                :total-pages="totalPages"
              />
            </div>
          </div>
          <div v-else class="text-center text-muted-foreground py-4 md:py-8">
            <p>該当する販売履歴がありません。</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Card, CardContent } from '~/components/ui/card'
import Input from '~/components/ui/input/Input.vue'
import UiPagination from '~/components/ui/Pagination.vue'
import Button from '~/components/ui/button/Button.vue'
import { DatePicker } from '~/components/ui/date-picker'

const supabase = useSupabaseClient()
const { showToast } = useAlert()
const { formatPrice, formatDate } = useFormatters()

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

// --- Date formatting helper ---
const toIsoDateString = (date: Date | null | undefined) => {
  if (!date) return undefined
  return date.toISOString().split('T')[0]
}

// --- Default to this month ---
const getThisMonthRange = () => {
  const today = new Date()
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1)
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  return { start: firstDay, end: lastDay }
}
const { start, end } = getThisMonthRange()
const startDate = ref<Date | null>(start)
const endDate = ref<Date | null>(end)
// -------------------------

const { data: sales, pending, error } = await useAsyncData('sales-history', async () => {
  const params: { start_date?: string; end_date?: string } = {}
  if (startDate.value) {
    params.start_date = toIsoDateString(startDate.value)
  }
  if (endDate.value) {
    const endOfDay = new Date(endDate.value)
    endOfDay.setHours(23, 59, 59, 999)
    params.end_date = endOfDay.toISOString()
  }

  const { data, error } = await supabase.rpc('get_sales_history', params)
  if (error) {
    showToast('エラー', '販売履歴の読み込みに失敗しました。', 'error')
    return []
  }
  return data
}, {
  default: () => [],
  watch: [startDate, endDate],
})

const filteredSales = computed(() => {
  if (!sales.value) return []
  if (!searchQuery.value) return sales.value

  const lowerCaseQuery = searchQuery.value.toLowerCase()
  return sales.value.filter(sale =>
    (sale.product_name && sale.product_name.toLowerCase().includes(lowerCaseQuery)) ||
    (sale.purchaser_username && sale.purchaser_username.toLowerCase().includes(lowerCaseQuery))
  )
})

const filteredAndPagedSales = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return filteredSales.value.slice(startIndex, startIndex + itemsPerPage)
})

const totalPages = computed(() => {
  if (!filteredSales.value) return 1
  return Math.ceil(filteredSales.value.length / itemsPerPage)
})

const totalSales = computed(() => {
  if (!sales.value) return 0
  // Note: This calculates total sales for the *fetched* data, which is already filtered by date on the backend.
  return sales.value.reduce((sum, sale) => sum + sale.price, 0)
})

const periodLabel = computed(() => {
  if (startDate.value && endDate.value) return '指定期間'
  if (startDate.value) return '指定日以降'
  if (endDate.value) return '指定日以前'
  return '全期間'
})

const setPeriod = (period: 'this_month' | 'this_year' | null) => {
  if (period === null) {
    startDate.value = null
    endDate.value = null
    return
  }

  const today = new Date()
  if (period === 'this_month') {
    const { start, end } = getThisMonthRange()
    startDate.value = start
    endDate.value = end
  } else if (period === 'this_year') {
    const firstDay = new Date(today.getFullYear(), 0, 1)
    const lastDay = new Date(today.getFullYear(), 11, 31)
    startDate.value = firstDay
    endDate.value = lastDay
  }
}

watch(searchQuery, () => {
  currentPage.value = 1
})
</script>

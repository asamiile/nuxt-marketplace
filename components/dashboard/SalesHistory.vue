<template>
  <UiCard>
    <UiCardHeader>
      <UiCardTitle>販売管理</UiCardTitle>
      <UiCardDescription>商品の売上履歴とサマリーを確認します。</UiCardDescription>
    </UiCardHeader>
    <UiCardContent class="space-y-6">
      <div class="grid grid-cols-2 gap-4 text-center">
        <div class="p-4 bg-secondary rounded-lg">
          <p class="text-sm text-muted-foreground">合計売上</p>
          <p class="text-2xl font-bold">{{ formatPrice(totalSales) }}</p>
        </div>
        <div class="p-4 bg-secondary rounded-lg">
          <p class="text-sm text-muted-foreground">販売数</p>
          <p class="text-2xl font-bold">{{ sales.length }} 件</p>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-semibold mb-2">販売履歴</h3>
        <div v-if="pending" class="text-center"><p>履歴を読み込んでいます...</p></div>
        <div v-else-if="error" class="text-center text-destructive"><p>履歴の読み込み中にエラーが発生しました。</p></div>
        <div v-else-if="sales.length === 0" class="text-center text-muted-foreground py-8">
          <p>まだ販売履歴がありません。</p>
        </div>
        <div v-else class="border rounded-lg overflow-hidden">
          <table class="min-w-full divide-y divide-border">
            <thead class="bg-muted/50">
              <tr>
                <th class="px-4 py-2 text-left text-sm font-medium text-muted-foreground">商品名</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-muted-foreground">購入者</th>
                <th class="px-4 py-2 text-left text-sm font-medium text-muted-foreground">販売日時</th>
                <th class="px-4 py-2 text-right text-sm font-medium text-muted-foreground">価格</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-border">
              <tr v-for="sale in sales" :key="sale.product_id + sale.purchased_at">
                <td class="px-4 py-2 font-medium">{{ sale.product_name }}</td>
                <td class="px-4 py-2 text-muted-foreground">{{ sale.purchaser_username }}</td>
                <td class="px-4 py-2 text-muted-foreground">{{ new Date(sale.purchased_at).toLocaleString() }}</td>
                <td class="px-4 py-2 text-right">{{ formatPrice(sale.price) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </UiCardContent>
  </UiCard>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
const supabase = useSupabaseClient()
const { showToast } = useAlert()

interface Sale {
  product_id: number;
  product_name: string;
  price: number;
  purchased_at: string;
  purchaser_username: string;
}

const sales = ref<Sale[]>([])
const pending = ref(true)
const error = ref<Error | null>(null)

onMounted(async () => {
  pending.value = true
  error.value = null
  try {
    const { data, error: rpcError } = await supabase.rpc('get_sales_history')
    if (rpcError) throw rpcError
    sales.value = data || []
  } catch (e: any) {
    error.value = e
    showToast('エラー', '販売履歴の読み込みに失敗しました。', 'error')
  } finally {
    pending.value = false
  }
})

const totalSales = computed(() => {
  return sales.value.reduce((sum, sale) => sum + sale.price, 0)
})

const formatPrice = (price: number | null) => {
  if (price === null) return 'N/A'
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
}
</script>

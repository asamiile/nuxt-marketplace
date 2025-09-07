<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">購入管理</h1>

    <!-- Purchases Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">購入日時</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">購入者名</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">商品名</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">価格</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
          <tr v-if="pending">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">読み込み中...</td>
          </tr>
          <tr v-else-if="error || !purchases || purchases.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">購入履歴が見つかりません。</td>
          </tr>
          <tr v-for="purchase in purchases" :key="purchase.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ new Date(purchase.created_at).toLocaleString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ purchase.user?.username || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ purchase.product?.name || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">¥{{ purchase.product?.price?.toLocaleString() || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '~/types/supabase'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const supabase = useSupabaseClient<Database>()
const { showToast } = useAlert()

const { data: purchases, pending, error } = await useAsyncData('purchases', async () => {
  const { data, error } = await supabase
    .from('purchases')
    .select(`
      id,
      created_at,
      user:profiles(username),
      product:products(name, price)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    showToast({
      title: 'エラー',
      description: `購入履歴の取得に失敗しました: ${error.message}`,
      variant: 'destructive',
    })
    return []
  }
  return data
}, {
  default: () => [],
})
</script>

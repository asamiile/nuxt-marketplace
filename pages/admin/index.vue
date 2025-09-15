<script setup lang="ts">
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

definePageMeta({
  layout: 'admin',
  middleware: ['admin'],
})

const { data: stats, pending, error } = await useFetch('/api/admin/dashboard-stats')

const dashboardCards = computed(() => [
  {
    title: '今月の売上',
    value: stats.value?.monthlySales?.toLocaleString() ?? 'N/A',
    unit: '円',
  },
  {
    title: '新規ユーザー数',
    value: stats.value?.newUsersCount?.toLocaleString() ?? 'N/A',
    unit: '人',
  },
  {
    title: '承認待ち商品数',
    value: stats.value?.pendingProductsCount?.toLocaleString() ?? 'N/A',
    unit: '件',
  },
  {
    title: '未対応の問い合わせ数',
    value: stats.value?.unresolvedContactsCount?.toLocaleString() ?? 'N/A',
    unit: '件',
  },
])
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-6">
      管理者ダッシュボード
    </h1>

    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card v-for="i in 4" :key="i">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            読み込み中...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            -
          </div>
        </CardContent>
      </Card>
    </div>

    <div v-else-if="error" class="text-red-500">
      データの取得中にエラーが発生しました: {{ error.message }}
    </div>

    <div v-else-if="stats" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card v-for="card in dashboardCards" :key="card.title">
        <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle class="text-sm font-medium">
            {{ card.title }}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div class="text-2xl font-bold">
            {{ card.value }}
            <span v-if="card.value !== 'N/A'" class="text-sm font-normal text-gray-500">{{ card.unit }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

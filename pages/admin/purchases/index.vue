<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">購入管理</h1>

    <!-- Purchases Table -->
    <div class="bg-card rounded-lg overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-secondary">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">購入ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">購入日時</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">購入者名</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">商品名</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">価格</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-if="pending">
            <td colspan="5" class="px-6 py-4 text-center text-muted-foreground">読み込み中...</td>
          </tr>
          <tr v-else-if="error || !paginatedPurchases || paginatedPurchases.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-muted-foreground">購入履歴が見つかりません。</td>
          </tr>
          <tr v-for="purchase in paginatedPurchases" :key="purchase.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <NuxtLink :to="`/admin/purchases/${purchase.id}`" class="text-link hover:underline whitespace-nowrap">
                {{ purchase.id }}
              </NuxtLink>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{{ new Date(purchase.created_at).toLocaleString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{{ purchase.user?.username || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">{{ purchase.product?.name || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">¥{{ purchase.product?.price?.toLocaleString() || 'N/A' }}</td>
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Database } from '~/types/supabase'
import UiPagination from '~/components/ui/Pagination.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { data: purchases, pending, error } = await useAsyncData(
  'purchases',
  () => $fetch('/api/admin/purchases'),
  { default: () => [] },
)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => {
  if (!purchases.value) return 1
  return Math.ceil(purchases.value.length / itemsPerPage)
})

const paginatedPurchases = computed(() => {
  if (!purchases.value) return []
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return purchases.value.slice(startIndex, startIndex + itemsPerPage)
})
</script>

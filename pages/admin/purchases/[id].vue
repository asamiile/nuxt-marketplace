<script setup lang="ts">
import { useRoute } from 'vue-router'

// Define a more specific type for the purchase data we expect from our API
interface PurchaseDetail {
  id: number;
  created_at: string;
  user_id: string;
  product_id: number;
  profiles: {
    username: string | null;
    email: string | null;
  } | null;
  products: {
    id: number;
    name: string;
    description: string | null;
    price: number;
  } | null;
}

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const { showToast } = useAlert()
const purchaseId = route.params.id as string

const { data: purchase, pending, error } = await useFetch<PurchaseDetail>(`/api/admin/purchases/${purchaseId}`, {
  onResponseError: ({ response }) => {
    showToast({
      title: 'エラー',
      description: '購入データの取得に失敗しました。',
      variant: 'destructive',
    })
  }
})

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('ja-JP')
}
</script>

<template>
  <div>
    <div v-if="pending">
      <p>読み込み中...</p>
    </div>
    <div v-else-if="error">
      <p>購入データが見つかりません。</p>
    </div>
    <div v-else-if="purchase">
      <h1 class="text-3xl font-bold mb-6">
        購入詳細: #{{ purchase.id }}
      </h1>

      <div class="space-y-8">
        <!-- Purchase Details -->
        <div class="text-card-foreground bg-card rounded-lg p-4 md:p-6">
          <h2 class="text-xl font-semibold mb-4 border-b pb-2">購入情報</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="font-semibold">購入ID</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ purchase.id }}</p>
            </div>
            <div>
              <h3 class="font-semibold">購入日時</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(purchase.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- Product Details -->
        <div class="text-card-foreground bg-card rounded-lg p-4 md:p-6">
          <h2 class="text-xl font-semibold mb-4 border-b pb-2">商品情報</h2>
          <div v-if="purchase.products" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="font-semibold">商品ID</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ purchase.products.id }}</p>
            </div>
            <div>
              <h3 class="font-semibold">商品名</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ purchase.products.name }}</p>
            </div>
            <div>
              <h3 class="font-semibold">価格</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">¥{{ purchase.products.price.toLocaleString() }}</p>
            </div>
            <div class="col-span-full">
              <h3 class="font-semibold">商品説明</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ purchase.products.description || 'N/A' }}</p>
            </div>
          </div>
           <div v-else>
            <p class="text-sm text-gray-500 dark:text-gray-400">商品情報がありません。</p>
          </div>
        </div>

        <!-- Customer Details -->
        <div class="text-card-foreground bg-card rounded-lg p-4 md:p-6">
          <h2 class="text-xl font-semibold mb-4 border-b pb-2">購入者情報</h2>
          <div v-if="purchase.profiles" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 class="font-semibold">ユーザーID</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ purchase.user_id }}</p>
            </div>
            <div>
              <h3 class="font-semibold">ユーザー名</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ purchase.profiles.username || 'N/A' }}</p>
            </div>
             <div>
              <h3 class="font-semibold">メールアドレス</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ purchase.profiles.email || 'N/A' }}</p>
            </div>
          </div>
          <div v-else>
            <p class="text-sm text-gray-500 dark:text-gray-400">購入者情報がありません。</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

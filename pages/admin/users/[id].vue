<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import type { Product } from '~/types/product'
import Button from '~/components/ui/button/Button.vue'
import Label from '~/components/ui/label/Label.vue'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const userId = route.params.id as string

const user = ref(null)
const products = ref<Product[]>([])
const pending = ref(true)
const error = ref<Error | null>(null)
const actionPending = ref(false)
const actionError = ref<string | null>(null)

// Product Pagination
const productsCurrentPage = ref(1)
const productsItemsPerPage = 10
const productTotalPages = computed(() => {
  return Math.ceil(products.value.length / productsItemsPerPage)
})
const paginatedProducts = computed(() => {
  const startIndex = (productsCurrentPage.value - 1) * productsItemsPerPage
  return products.value.slice(startIndex, startIndex + productsItemsPerPage)
})

const fetchUserData = async () => {
  pending.value = true
  try {
    // ユーザー情報の取得
    const userResponse = await fetch(`/api/admin/users/${userId}`)
    if (!userResponse.ok) throw new Error('ユーザー情報の取得に失敗しました。')
    user.value = await userResponse.json()

    // 商品一覧の取得
    const productsResponse = await fetch(`/api/admin/products?userId=${userId}`)
    if (!productsResponse.ok) throw new Error('商品一覧の取得に失敗しました。')
    products.value = await productsResponse.json()
  } catch (e: any) {
    error.value = e
  } finally {
    pending.value = false
  }
}

onMounted(fetchUserData)

const isBanned = (bannedUntil: string | null | undefined) => {
  if (!bannedUntil) return false
  if (bannedUntil.startsWith('0001-01-01')) return false
  return new Date(bannedUntil) > new Date()
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

const performAction = async (action: 'admin' | 'disable') => {
  actionPending.value = true
  actionError.value = null
  try {
    let url = ''
    let body = {}
    if (action === 'admin') {
      url = `/api/admin/users/${userId}/set-admin`
      body = { isAdmin: !user.value.is_admin }
    } else {
      url = `/api/admin/users/${userId}/disable`
      body = { disable: !isBanned(user.value.banned_until) }
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || 'アクションに失敗しました。')
    }

    // Refresh user data to get the latest state
    await fetchUserData()

  } catch (e: any) {
    actionError.value = e.message
  } finally {
    actionPending.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="pending">
      <p>読み込み中...</p>
    </div>
    <div v-else-if="error">
      <p class="text-destructive">{{ error.message }}</p>
    </div>
    <div v-else-if="user">
      <h1 class="text-3xl font-bold mb-6">
        ユーザー詳細: {{ user.username || user.email }}
      </h1>

      <div class="space-y-8">
        <!-- 基本情報 -->
        <div class="text-card-foreground bg-card rounded-lg p-4 md:p-6">
          <h2 class="text-xl font-semibold mb-4 border-b border-border pb-2">基本情報</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <h3 class="font-semibold mb-2">ユーザーID</h3>
              <p class="text-sm text-muted-foreground">{{ user.id }}</p>
            </div>
            <div>
              <h3 class="font-semibold mb-2">ユーザー名</h3>
              <p class="text-sm text-muted-foreground">{{ user.username || '未設定' }}</p>
            </div>
            <div>
              <h3 class="font-semibold mb-2">メールアドレス</h3>
              <p class="text-sm text-muted-foreground">{{ user.email }}</p>
            </div>
              <div>
              <h3 class="font-semibold mb-2">自己紹介</h3>
              <p class="text-sm text-muted-foreground">{{ user.bio || '未設定' }}</p>
            </div>
            <div>
              <h3 class="font-semibold mb-2">登録日時</h3>
              <p class="text-sm text-muted-foreground">{{ new Date(user.created_at).toLocaleString() }}</p>
            </div>
            <div>
              <h3 class="font-semibold mb-2">最終サインイン日時</h3>
              <p class="text-sm text-muted-foreground">{{ new Date(user.last_sign_in_at).toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <!-- 管理アクション -->
        <div class="text-card-foreground bg-card rounded-lg p-4 md:p-6">
          <h2 class="text-xl font-semibold mb-4 border-b border-border pb-2">管理アクション</h2>
          <div class="flex flex-wrap gap-4 items-center">
            <Button
              @click="performAction('admin')"
              :variant="user.is_admin ? 'secondary' : 'default'"
              :disabled="actionPending"
            >
              {{ user.is_admin ? '管理者から降格' : '管理者に設定' }}
            </Button>
            <Button
              @click="performAction('disable')"
              :variant="isBanned(user.banned_until) ? 'secondary' : 'destructive'"
              :disabled="actionPending"
            >
              {{ isBanned(user.banned_until) ? 'アカウントを有効化' : 'アカウントを無効化' }}
            </Button>
            <p v-if="actionError" class="text-destructive text-sm">{{ actionError }}</p>
          </div>
        </div>

          <!-- 出品商品一覧 -->
        <div class="text-card-foreground bg-card rounded-lg p-4 md:p-6">
            <h2 class="text-xl font-semibold mb-4 border-b border-border pb-2">出品商品一覧 ({{ products.length }}件)</h2>
            <div v-if="products.length > 0" class="bg-card rounded-lg overflow-x-auto">
              <table class="min-w-full">
                <thead class="bg-secondary">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">ID</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">商品名</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">価格</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">ステータス</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr v-for="product in paginatedProducts" :key="product.id">
                    <td class="px-4 py-2">{{ product.id }}</td>
                    <td class="px-4 py-2 whitespace-nowrap">
                      <NuxtLink :to="`/admin/products/${product.id}`" class="text-link">{{ product.name }}</NuxtLink>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{{ product.price }}円</td>
                    <td class="px-4 py-2">
                      <span
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                        :class="statusBadgeClass(product.status)"
                      >
                        {{ translateStatus(product.status) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-else class="text-muted-foreground">このユーザーはまだ商品を出品していません。</p>

            <div v-if="productTotalPages > 1" class="mt-4 flex justify-center">
              <Pagination
                v-slot="{ page }"
                v-model:page="productsCurrentPage"
                :total="products.length"
                :items-per-page="productsItemsPerPage"
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
      </div>

      <div class="mt-6">
        <NuxtLink to="/admin/users" class="text-sm text-link hover:underline">
          &larr; ユーザー一覧に戻る
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

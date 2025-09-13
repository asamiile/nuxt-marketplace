<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Product } from '~/types/product'
import Button from '~/components/ui/button/Button.vue'
import Label from '~/components/ui/label/Label.vue'

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
      <p class="text-red-500">{{ error.message }}</p>
    </div>
    <div v-else-if="user">
      <h1 class="text-3xl font-bold mb-6">
        ユーザー詳細: {{ user.username || user.email }}
      </h1>

      <div class="text-card-foreground bg-card rounded-lg p-4 md:p-8 space-y-8">
        <!-- 基本情報 -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">基本情報</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <Label>ユーザーID</Label>
              <p class="mt-1 text-sm text-gray-400">{{ user.id }}</p>
            </div>
            <div>
              <Label>ユーザー名</Label>
              <p class="mt-1">{{ user.username || '未設定' }}</p>
            </div>
            <div>
              <Label>メールアドレス</Label>
              <p class="mt-1">{{ user.email }}</p>
            </div>
             <div>
              <Label>自己紹介</Label>
              <p class="mt-1">{{ user.bio || '未設定' }}</p>
            </div>
            <div>
              <Label>登録日時</Label>
              <p class="mt-1">{{ new Date(user.created_at).toLocaleString() }}</p>
            </div>
            <div>
              <Label>最終サインイン日時</Label>
              <p class="mt-1">{{ new Date(user.last_sign_in_at).toLocaleString() }}</p>
            </div>
          </div>
        </div>

        <!-- 管理アクション -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">管理アクション</h2>
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
              :variant="isBanned(user.banned_until) ? 'outline' : 'destructive'"
              :disabled="actionPending"
            >
              {{ isBanned(user.banned_until) ? 'アカウントを有効化' : 'アカウントを無効化' }}
            </Button>
            <p v-if="actionError" class="text-red-500 text-sm">{{ actionError }}</p>
          </div>
        </div>

        <!-- 出品商品一覧 -->
        <div class="space-y-4">
          <h2 class="text-2xl font-semibold">出品商品一覧 ({{ products.length }}件)</h2>
          <div v-if="products.length > 0" class="border rounded-md overflow-x-auto">
            <table class="min-w-full">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-4 py-2 text-left text-sm font-medium">ID</th>
                  <th class="px-4 py-2 text-left text-sm font-medium">商品名</th>
                  <th class="px-4 py-2 text-left text-sm font-medium">価格</th>
                  <th class="px-4 py-2 text-left text-sm font-medium">ステータス</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="product in products" :key="product.id">
                  <td class="px-4 py-2">{{ product.id }}</td>
                  <td class="px-4 py-2">
                    <NuxtLink :to="`/admin/products/${product.id}`" class="text-blue-600 hover:underline">{{ product.name }}</NuxtLink>
                  </td>
                  <td class="px-4 py-2">{{ product.price }}円</td>
                  <td class="px-4 py-2">{{ product.status }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p v-else class="text-gray-500">このユーザーはまだ商品を出品していません。</p>
        </div>
      </div>

      <div class="mt-6">
        <NuxtLink to="/admin/users" class="text-sm text-blue-600 hover:underline">
          &larr; ユーザー一覧に戻る
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

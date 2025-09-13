<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">ユーザー詳細</h1>

    <div v-if="pending" class="text-center">
      <p>読み込み中...</p>
    </div>

    <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
      <strong class="font-bold">エラー:</strong>
      <span class="block sm:inline">{{ error.message }}</span>
    </div>

    <div v-if="user" class="space-y-6">
      <!-- ユーザー情報 -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">基本情報</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><strong>ID:</strong> {{ user.id }}</div>
          <div><strong>Email:</strong> {{ user.email }}</div>
          <div><strong>ユーザー名:</strong> {{ user.username || '未設定' }}</div>
          <div><strong>自己紹介:</strong> {{ user.bio || '未設定' }}</div>
          <div><strong>登録日:</strong> {{ new Date(user.created_at).toLocaleString() }}</div>
          <div><strong>最終サインイン:</strong> {{ new Date(user.last_sign_in_at).toLocaleString() }}</div>
        </div>
      </div>

      <!-- 管理アクション -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">管理アクション</h2>
        <div class="flex space-x-4 items-center">
          <button
            @click="toggleAdminStatus"
            :class="[
              'font-bold py-2 px-4 rounded',
              user.is_admin ? 'bg-yellow-500 hover:bg-yellow-700' : 'bg-blue-500 hover:bg-blue-700',
              'text-white'
            ]"
            :disabled="actionPending"
          >
            {{ user.is_admin ? '管理者から降格' : '管理者に設定' }}
          </button>
          <button
            @click="toggleDisableStatus"
            :class="[
              'font-bold py-2 px-4 rounded',
               isBanned(user.banned_until) ? 'bg-green-500 hover:bg-green-700' : 'bg-red-500 hover:bg-red-700',
              'text-white'
            ]"
            :disabled="actionPending"
          >
            {{ isBanned(user.banned_until) ? 'アカウントを有効化' : 'アカウントを無効化' }}
          </button>
          <p v-if="actionError" class="text-red-500">{{ actionError }}</p>
        </div>
      </div>

      <!-- 出品商品一覧 -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">出品商品一覧</h2>
        <div v-if="products.length > 0" class="overflow-x-auto">
          <table class="min-w-full bg-white">
            <thead>
              <tr>
                <th class="py-2 px-4 border-b">ID</th>
                <th class="py-2 px-4 border-b">商品名</th>
                <th class="py-2 px-4 border-b">価格</th>
                <th class="py-2 px-4 border-b">ステータス</th>
                <th class="py-2 px-4 border-b">登録日</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="product in products" :key="product.id">
                <td class="py-2 px-4 border-b">{{ product.id }}</td>
                <td class="py-2 px-4 border-b">{{ product.name }}</td>
                <td class="py-2 px-4 border-b">{{ product.price }}円</td>
                <td class="py-2 px-4 border-b">{{ product.status }}</td>
                <td class="py-2 px-4 border-b">{{ new Date(product.created_at).toLocaleString() }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <p>このユーザーはまだ商品を出品していません。</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Product } from '~/types/product'

const route = useRoute()
const userId = route.params.id as string

const user = ref(null)
const products = ref<Product[]>([])
const pending = ref(true)
const error = ref<Error | null>(null)
const actionPending = ref(false)
const actionError = ref<string | null>(null)

const isBanned = (bannedUntil: string | null | undefined) => {
  if (!bannedUntil) return false
  // '0001-01-01T00:00:00Z' は実質的にbanされていない状態を示すことがある
  if (bannedUntil.startsWith('0001-01-01')) return false
  return new Date(bannedUntil) > new Date()
}

const toggleDisableStatus = async () => {
  if (!user.value) return
  actionPending.value = true
  actionError.value = null
  const shouldDisable = !isBanned(user.value.banned_until)
  try {
    const response = await fetch(`/api/admin/users/${userId}/disable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ disable: shouldDisable }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || 'アカウントの状態変更に失敗しました。')
    }
    const data = await response.json()
    // 成功したらユーザー情報を更新
    user.value.banned_until = data.banned_until
  } catch (e: any) {
    actionError.value = e.message
  } finally {
    actionPending.value = false
  }
}

const toggleAdminStatus = async () => {
  if (!user.value) return
  actionPending.value = true
  actionError.value = null
  try {
    const response = await fetch(`/api/admin/users/${userId}/set-admin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isAdmin: !user.value.is_admin }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.statusMessage || '権限の変更に失敗しました。')
    }
    // 成功したらユーザー情報を更新
    user.value.is_admin = !user.value.is_admin
  } catch (e: any) {
    actionError.value = e.message
  } finally {
    actionPending.value = false
  }
}

onMounted(async () => {
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
})
</script>

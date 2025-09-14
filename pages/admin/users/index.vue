<script setup lang="ts">
import { ref, computed } from 'vue'
import UiPagination from '~/components/ui/Pagination.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { showToast } = useAlert()

const { data: users, pending, error } = await useFetch('/api/admin/users', {
  onResponseError: ({ response }) => {
    console.error(response._data)
    showToast('エラー', 'ユーザー情報の取得に失敗しました。', 'error')
  },
  default: () => [],
})

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => {
  if (!users.value) return 1
  return Math.ceil(users.value.length / itemsPerPage)
})

const paginatedUsers = computed(() => {
  if (!users.value) return []
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return users.value.slice(startIndex, startIndex + itemsPerPage)
})

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('ja-JP')
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">
      ユーザー管理
    </h1>
    <div class="bg-card rounded-lg overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-secondary">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              ユーザー名
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              メールアドレス
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              登録日時
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              最終サインイン日時
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              管理者
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap whitespace-nowrap">
              ステータス
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-if="pending">
            <td colspan="6" class="px-6 py-4 text-center text-muted-foreground">読み込み中...</td>
          </tr>
          <tr v-else-if="error || !paginatedUsers || paginatedUsers.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-muted-foreground">
              ユーザーが見つかりません。
            </td>
          </tr>
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
              <NuxtLink :to="`/admin/users/${user.id}`" class="text-primary">
                {{ user.username || '(未設定)' }}
              </NuxtLink>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
              {{ user.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
              {{ formatDate(user.last_sign_in_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', user.is_admin ? 'bg-green-100 text-green-800' : 'bg-secondary text-secondary-foreground']">
                {{ user.is_admin ? 'はい' : 'いいえ' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', user.banned_until && new Date(user.banned_until) > new Date() ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800']">
                {{ user.banned_until && new Date(user.banned_until) > new Date() ? '無効' : '有効' }}
              </span>
            </td>
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

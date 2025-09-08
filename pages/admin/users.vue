<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UiPagination from '~/components/ui/Pagination.vue'
import UiButton from '~/components/ui/button/Button.vue'

// Define the user type based on the get_all_users function return type
interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string
  is_admin: boolean
  username: string | null
}

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { showToast } = useAlert()

// --- Data Fetching ---
// For now, we remove the search functionality to be consistent with other pages.
// The search API is ready if we want to add it back later.
const { data: users, pending, error, refresh } = await useFetch('/api/admin/users', {
  onResponseError: ({ response }) => {
    showToast({ title: 'エラー', description: 'ユーザー情報の取得に失敗しました。', variant: 'destructive' })
  },
  default: () => [],
})

// --- Pagination ---
const currentPage = ref(1)
const itemsPerPage = 10
const totalPages = computed(() => users.value ? Math.ceil(users.value.length / itemsPerPage) : 1)
const paginatedUsers = computed(() => {
  if (!users.value) return []
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return users.value.slice(startIndex, startIndex + itemsPerPage)
})

// --- Delete ---
const handleDeleteUser = async (userId: string) => {
  if (!confirm('本当にこのユーザーを削除しますか？Auth情報とプロフィールが完全に削除され、復元できません。')) return
  try {
    await $fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    showToast({ title: '成功', description: 'ユーザーが削除されました。' })
    await refresh()
  } catch (err: any) {
    showToast({ title: 'エラー', description: err.data?.message || '削除に失敗しました。', variant: 'destructive' })
  }
}

const formatDate = (date: string | null) => date ? new Date(date).toLocaleString('ja-JP') : 'N/A'
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">ユーザー管理</h1>

    <!-- Users Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg overflow-x-auto">
       <table class="min-w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">UUID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">メールアドレス</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ユーザー名</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">管理者</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">操作</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
          <tr v-if="pending">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">読み込み中...</td>
          </tr>
          <tr v-else-if="error || !paginatedUsers || paginatedUsers.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">ユーザーが見つかりません。</td>
          </tr>
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                <NuxtLink :to="`/admin/users/${user.id}`" class="text-blue-600 hover:underline dark:text-blue-400">
                    {{ user.id.substring(0, 8) }}...
                </NuxtLink>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ user.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ user.username || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                {{ user.is_admin ? 'はい' : 'いいえ' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <NuxtLink :to="`/admin/users/${user.id}`" class="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200">
                編集
              </NuxtLink>
              <UiButton variant="destructive" size="sm" @click="handleDeleteUser(user.id)">削除</UiButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="mt-6 flex justify-center">
      <UiPagination v-model:currentPage="currentPage" :total-pages="totalPages" />
    </div>
  </div>
</template>

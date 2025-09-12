<script setup lang="ts">
import { ref, computed } from 'vue'
import UiPagination from '~/components/ui/Pagination.vue'
import Button from '~/components/ui/button/Button.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { showToast } = useAlert()

const { data: users, pending, error, refresh } = await useFetch('/api/admin/users', {
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

const handleDisableUser = async (user: any) => {
  const action = user.aud === 'authenticated' ? '無効化' : '有効化'
  if (!confirm(`本当にこのユーザーを${action}しますか？`)) return

  try {
    await $fetch(`/api/admin/users/${user.id}/disable`, {
      method: 'POST',
      body: { disabled: user.aud === 'authenticated' },
    })
    showToast('成功', `ユーザーが${action}されました。`)
    await refresh()
  } catch (err: any) {
    console.error(`Failed to ${action} user:`, err)
    showToast('エラー', err.data?.message || `ユーザーの${action}に失敗しました。`, 'error')
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">
      ユーザー管理
    </h1>
    <div class="bg-white dark:bg-gray-800 rounded-lg overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              メールアドレス
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              登録日時
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              最終サインイン日時
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              管理者
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              ステータス
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
          <tr v-if="pending">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">読み込み中...</td>
          </tr>
          <tr v-else-if="error || !paginatedUsers || paginatedUsers.length === 0">
            <td colspan="6" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              ユーザーが見つかりません。
            </td>
          </tr>
          <tr v-for="user in paginatedUsers" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {{ user.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(user.last_sign_in_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                {{ user.is_admin ? 'はい' : 'いいえ' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', user.aud === 'authenticated' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                {{ user.aud === 'authenticated' ? '有効' : '無効' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <Button
                size="sm"
                :variant="user.aud === 'authenticated' ? 'destructive' : 'default'"
                @click="handleDisableUser(user)"
              >
                {{ user.aud === 'authenticated' ? '無効化' : '有効化' }}
              </Button>
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

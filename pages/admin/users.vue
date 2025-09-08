<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { showToast } = useAlert()

const { data: users, refresh } = await useFetch('/api/admin/users', {
  onResponseError: ({ response }) => {
    console.error(response._data)
    showToast({
      title: 'エラー',
      description: 'ユーザー情報の取得に失敗しました。',
      variant: 'destructive',
    })
  },
  default: () => [],
})

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString('ja-JP')
}

const ADMIN_EMAIL = 'admin@example.com' // The email of the primary admin to protect

const handleAdminStatusChange = async (user: any) => {
  // Immediately update the UI for responsiveness
  const originalStatus = user.is_admin
  user.is_admin = !user.is_admin

  try {
    await $fetch(`/api/admin/users/${user.id}`, {
      method: 'PUT',
      body: { is_admin: user.is_admin },
    })

    showToast({
      title: '成功',
      description: '管理者権限を更新しました。',
    })
    await refresh()
  }
  catch (error: any) {
    // Revert the switch on error
    user.is_admin = originalStatus
    console.error(error)
    showToast({
      title: 'エラー',
      description: error.data?.message || '管理者権限の更新に失敗しました。',
      variant: 'destructive',
    })
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
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
          <tr v-if="!users || users.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
              ユーザーが見つかりません。
            </td>
          </tr>
          <tr v-for="user in users" :key="user.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
              {{ user.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(user.last_sign_in_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  v-model="user.is_admin"
                  class="sr-only peer"
                  :disabled="user.email === ADMIN_EMAIL"
                  @change="handleAdminStatusChange(user)"
                >
                <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600" :class="{ 'cursor-not-allowed opacity-50': user.email === ADMIN_EMAIL }"></div>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

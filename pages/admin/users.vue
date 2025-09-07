<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const supabase = useSupabaseClient()
const { alert } = useAlert()

const { data: users, refresh, error } = await useFetch('/api/admin/users', {
  onResponseError: ({ response }) => {
    console.error(response._data)
    alert({
      type: 'error',
      message: 'ユーザー情報の取得に失敗しました。',
    })
  },
})

const formatDate = (date: string) => {
  if (!date) return ''
  return new Date(date).toLocaleString('ja-JP')
}

const handleAdminStatusChange = async (user: any) => {
  const { error } = await supabase.rpc('set_admin_status', {
    user_id: user.id,
    p_is_admin: user.is_admin,
  })

  if (error) {
    console.error(error)
    alert({
      type: 'error',
      message: '管理者権限の更新に失敗しました。',
    })
    // Revert the switch on error
    user.is_admin = !user.is_admin
  } else {
    alert({
      type: 'success',
      message: '管理者権限を更新しました。',
    })
    refresh()
  }
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">
      ユーザー管理
    </h1>
    <div class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th class="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              メールアドレス
            </th>
            <th class="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              登録日時
            </th>
            <th class="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              最終サインイン日時
            </th>
            <th class="px-6 py-3 border-b-2 border-gray-200 bg-gray-50 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              管理者
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!users || users.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">
              ユーザーが見つかりません。
            </td>
          </tr>
          <tr v-for="user in users" :key="user.id" class="border-b">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ user.email }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ formatDate(user.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ formatDate(user.last_sign_in_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <label class="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  :checked="user.is_admin"
                  class="sr-only peer"
                  @change="handleAdminStatusChange(user)"
                >
                <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:bg-blue-600" />
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
/* Basic toggle switch styles */
.peer:checked ~ .peer-checked\:bg-blue-600 {
    background-color: #2563eb;
}
.peer:checked ~ div::before {
    transform: translateX(1.25rem);
    border-color: white;
}
div::before {
    content: '';
    position: absolute;
    top: 0.25rem;
    left: 0.25rem;
    width: 1.25rem;
    height: 1.25rem;
    background-color: white;
    border-radius: 9999px;
    transition: transform 0.2s;
}
</style>

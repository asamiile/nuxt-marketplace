<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import UiPagination from '~/components/ui/Pagination.vue'
import UiButton from '~/components/ui/button/Button.vue'
import UiFormInput from '~/components/ui/form/Input.vue'
import UiFormTextarea from '~/components/ui/form/Textarea.vue'
import UiFormLabel from '~/components/ui/form/Label.vue'

// Define the user type based on the get_all_users function return type
interface User {
  id: string
  email: string
  created_at: string
  last_sign_in_at: string
  is_admin: boolean
  username: string | null
  bio?: string | null // Bio might not be returned from the list view, but needed for edit
}

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { showToast } = useAlert()

// --- Data Fetching & Search ---
const searchQuery = ref('')
const { data: users, pending, error, refresh } = await useFetch('/api/admin/users', {
  query: { q: searchQuery },
  watch: [searchQuery], // Automatically re-fetch when searchQuery changes
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

// --- Edit Modal ---
const isEditModalOpen = ref(false)
const editingUser = ref<User | null>(null)
const form = ref({
  username: '',
  bio: '',
  is_admin: false,
})

const openEditModal = (user: User) => {
  editingUser.value = user
  // We need to fetch full profile for bio. For now, assume it might be missing.
  // A better implementation might fetch the full profile here.
  form.value = {
    username: user.username || '',
    bio: user.bio || '', // This field is not in the list view, so it will be empty
    is_admin: user.is_admin,
  }
  isEditModalOpen.value = true
}

const handleUpdateUser = async () => {
  if (!editingUser.value) return
  try {
    await $fetch(`/api/admin/users/${editingUser.value.id}`, {
      method: 'PUT',
      body: form.value,
    })
    showToast({ title: '成功', description: 'ユーザー情報が更新されました。' })
    isEditModalOpen.value = false
    await refresh()
  } catch (err: any) {
    showToast({ title: 'エラー', description: err.data?.message || '更新に失敗しました。', variant: 'destructive' })
  }
}

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

    <!-- Search Box -->
    <div class="mb-6">
      <UiFormInput
        v-model="searchQuery"
        placeholder="メールアドレスまたはユーザー名で検索..."
        class="max-w-sm"
      />
    </div>

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
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ user.id.substring(0, 8) }}...</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ user.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ user.username || 'N/A' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                {{ user.is_admin ? 'はい' : 'いいえ' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <UiButton variant="outline" size="sm" @click="openEditModal(user)">編集</UiButton>
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

    <!-- Edit Modal -->
    <div v-if="isEditModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">ユーザー情報を編集</h2>
        <form @submit.prevent="handleUpdateUser" class="space-y-4">
          <div>
            <UiFormLabel for="username">ユーザー名</UiFormLabel>
            <UiFormInput v-model="form.username" id="username" class="mt-1" />
          </div>
          <div>
            <UiFormLabel for="bio">自己紹介</UiFormLabel>
            <UiFormTextarea v-model="form.bio" id="bio" :rows="3" class="mt-1" />
          </div>
          <div class="flex items-center space-x-3 pt-2">
            <input type="checkbox" id="is_admin" v-model="form.is_admin" class="h-4 w-4 rounded border-gray-300" />
            <UiFormLabel for="is_admin" class="font-medium">管理者権限</UiFormLabel>
          </div>
          <div class="flex justify-end gap-4 pt-4">
            <UiButton type="button" variant="ghost" @click="isEditModalOpen = false">キャンセル</UiButton>
            <UiButton type="submit">更新</UiButton>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

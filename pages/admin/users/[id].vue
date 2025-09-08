<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Button from '~/components/ui/button/Button.vue'
import Label from '~/components/ui/form/Label.vue'

// Define a type for the user data we expect from our API
interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  is_admin: boolean;
}

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const { showToast } = useAlert()
const userId = route.params.id as string

const isAdmin = ref(false)
const isSaving = ref(false)

const { data: user, pending, error } = await useFetch<User>(`/api/admin/users/${userId}`, {
  onResponse({ response }) {
    if (response.ok) {
      isAdmin.value = response._data.is_admin
    }
  },
  onResponseError: ({ response }) => {
    showToast({
      title: 'エラー',
      description: 'ユーザーデータの取得に失敗しました。',
      variant: 'destructive',
    })
  }
})

const handleSave = async () => {
  isSaving.value = true
  try {
    await $fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: { is_admin: isAdmin.value },
    })
    showToast({
      title: '成功',
      description: 'ユーザー情報が正常に更新されました。',
    })
  } catch (err) {
    console.error('Failed to update user:', err)
    showToast({
      title: 'エラー',
      description: 'ユーザー情報の更新に失敗しました。',
      variant: 'destructive',
    })
  } finally {
    isSaving.value = false
  }
}

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
      <p>ユーザーが見つかりません。</p>
    </div>
    <div v-else-if="user">
      <h1 class="text-3xl font-bold mb-6">
        ユーザー編集: {{ user.email }}
      </h1>

      <div class="text-card-foreground bg-card rounded-lg p-4 md:p-8">
        <div class="space-y-4 mb-8">
          <div>
            <h3 class="font-semibold">UUID</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.id }}</p>
          </div>
          <div>
            <h3 class="font-semibold">メールアドレス</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
          </div>
          <div>
            <h3 class="font-semibold">登録日時</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(user.created_at) }}</p>
          </div>
          <div>
            <h3 class="font-semibold">最終サインイン日時</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(user.last_sign_in_at) }}</p>
          </div>
        </div>

        <form @submit.prevent="handleSave" class="space-y-6 border-t pt-6">
          <div class="flex items-center space-x-3">
            <input
              type="checkbox"
              id="is_admin"
              v-model="isAdmin"
              class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label for="is_admin" class="font-medium">管理者権限</Label>
          </div>
          <div class="pt-2">
            <Button type="submit" class="w-full" size="lg" :disabled="isSaving">
              {{ isSaving ? '保存中...' : '保存する' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

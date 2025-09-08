<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Button from '~/components/ui/button/Button.vue'
import Label from '~/components/ui/form/Label.vue'
import Input from '~/components/ui/form/Input.vue'
import Textarea from '~/components/ui/form/Textarea.vue'

// Define a type for the user data we expect from our API
interface User {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string;
  is_admin: boolean;
  username: string | null;
  bio: string | null;
}

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const { showToast } = useAlert()
const userId = route.params.id as string

const form = ref({
  username: '',
  bio: '',
  is_admin: false,
})
const isSaving = ref(false)

const { data: user, pending, error } = await useFetch<User>(`/api/admin/users/${userId}`, {
  onResponse({ response }) {
    if (response.ok) {
      const { username, bio, is_admin } = response._data
      form.value = {
        username: username || '',
        bio: bio || '',
        is_admin: is_admin,
      }
    }
  },
  onResponseError: () => {
    showToast({ title: 'エラー', description: 'ユーザーデータの取得に失敗しました。', variant: 'destructive' })
  }
})

const handleSave = async () => {
  isSaving.value = true
  try {
    await $fetch(`/api/admin/users/${userId}`, {
      method: 'PUT',
      body: {
        username: form.value.username,
        bio: form.value.bio,
        is_admin: form.value.is_admin,
      },
    })
    showToast({ title: '成功', description: 'ユーザー情報が正常に更新されました。' })
  } catch (err: any) {
    console.error('Failed to update user:', err)
    showToast({ title: 'エラー', description: err.data?.message || 'ユーザー情報の更新に失敗しました。', variant: 'destructive' })
  } finally {
    isSaving.value = false
  }
}

const formatDate = (date: string | null) => date ? new Date(date).toLocaleString('ja-JP') : 'N/A'
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
        <form @submit.prevent="handleSave" class="space-y-6">
          <!-- Read-only Info -->
          <div class="space-y-2 pb-6 border-b">
            <div>
              <h3 class="font-semibold">UUID</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.id }}</p>
            </div>
            <div>
              <h3 class="font-semibold">メールアドレス</h3>
              <p class="text-sm text-gray-500 dark:text-gray-400">{{ user.email }}</p>
            </div>
          </div>

          <!-- Editable Fields -->
           <div>
            <Label for="username">ユーザー名</Label>
            <Input v-model="form.username" id="username" class="mt-1" />
          </div>
          <div>
            <Label for="bio">自己紹介</Label>
            <Textarea v-model="form.bio" id="bio" :rows="3" class="mt-1" />
          </div>
          <div class="flex items-center space-x-3 pt-2">
            <input
              type="checkbox"
              id="is_admin"
              v-model="form.is_admin"
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

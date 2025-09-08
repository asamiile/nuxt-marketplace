<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Input from '~/components/ui/form/Input.vue'
import Label from '~/components/ui/form/Label.vue'
import Button from '~/components/ui/button/Button.vue'
import type { Category } from '~/types/product'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const { showToast } = useAlert()
const categoryId = route.params.id as string

const form = ref({
  name: '',
})
const isSaving = ref(false)

const { data: category, pending, error } = await useFetch<Category>(`/api/admin/categories/${categoryId}`, {
  onResponse({ response }) {
    if (response.ok) {
      form.value.name = response._data.name
    }
  },
  onResponseError: ({ response }) => {
    showToast({
      title: 'エラー',
      description: 'カテゴリデータの取得に失敗しました。',
      variant: 'destructive',
    })
  }
})

const handleSave = async () => {
  isSaving.value = true
  if (!form.value.name.trim()) {
    showToast({
      title: 'エラー',
      description: 'カテゴリ名は必須です。',
      variant: 'destructive',
    })
    isSaving.value = false
    return
  }

  try {
    await $fetch(`/api/admin/categories/${categoryId}`, {
      method: 'PUT',
      body: { name: form.value.name.trim() },
    })
    showToast({
      title: '成功',
      description: 'カテゴリ情報が正常に更新されました。',
    })
    // Optionally, navigate back or refresh data
    await navigateTo('/admin/categories')
  } catch (err) {
    console.error('Failed to update category:', err)
    showToast({
      title: 'エラー',
      description: 'カテゴリ情報の更新に失敗しました。',
      variant: 'destructive',
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="pending">
      <p>読み込み中...</p>
    </div>
    <div v-else-if="error">
      <p>データが見つかりません。</p>
    </div>
    <div v-else-if="category">
      <h1 class="text-3xl font-bold mb-6">
        カテゴリ編集: {{ category.name }}
      </h1>

      <div class="text-card-foreground bg-card rounded-lg p-4 md:p-8">
        <form @submit.prevent="handleSave" class="space-y-6">
          <div>
            <Label for="name">カテゴリ名</Label>
            <Input v-model="form.name" type="text" id="name" class="mt-1" />
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

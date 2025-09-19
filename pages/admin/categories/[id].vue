<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import Button from '~/components/ui/button/Button.vue'
import AdminCard from '~/components/admin/AdminCard.vue'
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
  is_public: true,
})
const isSaving = ref(false)

const { data: category, pending, error, refresh } = await useFetch<Category>(`/api/admin/categories/${categoryId}`, {
  onResponse({ response }) {
    if (response.ok && response._data) {
      form.value.name = response._data.name
      form.value.is_public = response._data.is_public
    }
  },
  onResponseError: ({ response }) => {
    showToast({ title: 'エラー', description: 'カテゴリデータの取得に失敗しました。', variant: 'error' })
  }
})

const supabase = useSupabaseClient()

const handleSave = async () => {
  isSaving.value = true
  try {
    await $fetch(`/api/admin/categories/${categoryId}`, {
      method: 'PUT',
      body: {
        name: form.value.name.trim(),
        is_public: form.value.is_public,
      },
    })
    showToast({ title: '成功', description: 'カテゴリ情報が正常に更新されました。' })
    await refresh()
  } catch (err: any) {
    console.error('Failed to update category:', err)
    showToast({ title: 'エラー', description: err.data?.message || 'カテゴリ情報の更新に失敗しました。', variant: 'error' })
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
      <div class="flex flex-col justify-between items-start md:flex-row gap-4 mb-6">
        <h1 class="text-3xl font-bold">
          カテゴリ編集: {{ category.name }}
        </h1>
        <span :class="['px-3 py-1 text-sm leading-5 font-semibold rounded-full', category.is_public ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
          {{ category.is_public ? '公開' : '非公開' }}
        </span>
      </div>


      <AdminCard title="カテゴリ情報">
        <form @submit.prevent="handleSave" class="space-y-6">
          <div>
            <Label for="name">カテゴリ名</Label>
            <Input v-model="form.name" type="text" id="name" class="mt-1" />
          </div>
          <div class="flex items-center space-x-2">
            <input type="checkbox" v-model="form.is_public" id="is_public" class="h-4 w-4 rounded border-border text-primary focus:ring-primary" />
            <Label for="is_public">公開する</Label>
          </div>
          <div class="pt-2">
            <Button type="submit" class="w-full" size="lg" :disabled="isSaving">
              {{ isSaving ? '保存中...' : '保存する' }}
            </Button>
          </div>
        </form>
      </AdminCard>

      <div class="mt-6">
        <NuxtLink to="/admin/categories" class="text-sm text-link hover:underline">
          &larr; カテゴリ一覧に戻る
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

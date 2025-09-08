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
    showToast('エラー', 'カテゴリデータの取得に失敗しました。', 'error')
  }
})

const supabase = useSupabaseClient()

const handleSave = async () => {
  isSaving.value = true

  // If unpublishing, check if category is in use
  if (category.value?.is_public && !form.value.is_public) {
    const { count, error } = await supabase
      .from('products')
      .select('id', { count: 'exact', head: true })
      .eq('category_id', categoryId)

    if (error) {
      showToast('エラー', '商品の確認中にエラーが発生しました。', 'error')
      isSaving.value = false
      return
    }
    if (count && count > 0) {
      showToast('更新不可', 'このカテゴリは商品に利用されているため、非公開にできません。', 'error')
      form.value.is_public = true // Revert checkbox
      isSaving.value = false
      return
    }
  }

  try {
    await $fetch(`/api/admin/categories/${categoryId}`, {
      method: 'PUT',
      body: {
        name: form.value.name.trim(),
        is_public: form.value.is_public,
      },
    })
    showToast('成功', 'カテゴリ情報が正常に更新されました。')
    await refresh()
  } catch (err: any) {
    console.error('Failed to update category:', err)
    showToast('エラー', err.data?.message || 'カテゴリ情報の更新に失敗しました。', 'error')
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
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">
          カテゴリ編集: {{ category.name }}
        </h1>
        <span :class="['px-3 py-1 text-sm leading-5 font-semibold rounded-full', category.is_public ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
          {{ category.is_public ? '公開' : '非公開' }}
        </span>
      </div>


      <div class="text-card-foreground bg-card rounded-lg p-4 md:p-8">
        <form @submit.prevent="handleSave" class="space-y-6">
          <div>
            <Label for="name">カテゴリ名</Label>
            <Input v-model="form.name" type="text" id="name" class="mt-1" />
          </div>
          <div class="flex items-center space-x-2">
            <input type="checkbox" v-model="form.is_public" id="is_public" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <Label for="is_public">公開する</Label>
          </div>
          <div class="pt-2">
            <Button type="submit" class="w-full" size="lg" :disabled="isSaving">
              {{ isSaving ? '保存中...' : '保存する' }}
            </Button>
          </div>
        </form>
      </div>

      <div class="mt-6">
        <NuxtLink to="/admin/categories" class="text-sm text-blue-600 hover:underline dark:text-blue-400">
          &larr; カテゴリ一覧に戻る
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

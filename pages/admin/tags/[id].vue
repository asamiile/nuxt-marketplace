<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import Button from '~/components/ui/button/Button.vue'
import { Checkbox } from '~/components/ui/checkbox'
import type { Tag } from '~/types/product'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const { showToast } = useAlert()
const tagId = route.params.id as string

const form = ref({
  name: '',
  is_public: true,
})
const isSaving = ref(false)

const { data: tag, pending, error, refresh } = await useFetch<Tag>(`/api/admin/tags/${tagId}`, {
  onResponse({ response }) {
    if (response.ok && response._data) {
      form.value.name = response._data.name
      form.value.is_public = response._data.is_public
    }
  },
  onResponseError: ({ response }) => {
    showToast({ title: 'エラー', description: 'タグデータの取得に失敗しました。', variant: 'error' })
  }
})

const handleSave = async () => {
  isSaving.value = true
  try {
    await $fetch(`/api/admin/tags/${tagId}`, {
      method: 'PUT',
      body: {
        name: form.value.name.trim(),
        is_public: form.value.is_public,
      },
    })
    showToast({ title: '成功', description: 'タグ情報が正常に更新されました。' })
    await refresh()
  } catch (err) {
    console.error('Failed to update tag:', err)
    showToast({ title: 'エラー', description: 'タグ情報の更新に失敗しました。', variant: 'error' })
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
    <div v-else-if="tag">
      <div class="flex flex-col justify-between items-start md:flex-row gap-4 mb-6">
        <h1 class="text-3xl font-bold">
          タグ編集: {{ tag.name }}
        </h1>
        <span :class="['px-3 py-1 text-sm leading-5 font-semibold rounded-full', tag.is_public ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
          {{ tag.is_public ? '公開' : '非公開' }}
        </span>
      </div>

      <div class="text-card-foreground bg-card rounded-lg p-4 md:p-8">
        <form @submit.prevent="handleSave" class="space-y-6">
          <div>
            <Label for="name">タグ名</Label>
            <Input v-model="form.name" type="text" id="name" class="mt-1" />
          </div>
          <div class="flex items-center space-x-2">
            <Checkbox id="is_public" :checked="form.is_public" @update:checked="form.is_public = $event" />
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
        <NuxtLink to="/admin/tags" class="text-sm text-link hover:underline">
          &larr; タグ一覧に戻る
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

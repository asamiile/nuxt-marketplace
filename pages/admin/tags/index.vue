<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">タグ管理</h1>

    <!-- New Tag Form -->
    <div class="mb-8 p-4 bg-white dark:bg-secondary rounded-lg">
      <h2 class="text-xl font-semibold mb-4">新規タグ作成</h2>
      <form @submit.prevent="handleCreateTag">
        <div class="flex items-center gap-4">
          <Input
            v-model="newTagName"
            placeholder="タグ名"
            required
            class="flex-grow"
          />
          <Button type="submit" :disabled="pending" class="whitespace-nowrap">
            {{ pending ? '作成中...' : '作成' }}
          </Button>
        </div>
      </form>
    </div>

    <!-- Tags Table -->
    <div class="bg-white dark:bg-secondary rounded-lg overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">名前</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ステータス</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">作成日時</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
          <tr v-if="pending">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">読み込み中...</td>
          </tr>
          <tr v-else-if="error || !paginatedTags || paginatedTags.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">タグが見つかりません。</td>
          </tr>
          <tr v-for="tag in paginatedTags" :key="tag.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              <NuxtLink :to="`/admin/tags/${tag.id}`" class="text-blue-600 hover:underline dark:text-blue-400">
                {{ tag.id }}
              </NuxtLink>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ tag.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', tag.is_public ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                {{ tag.is_public ? '公開' : '非公開' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ new Date(tag.created_at).toLocaleString() }}</td>
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

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Tag } from '~/types/product'
import UiPagination from '~/components/ui/Pagination.vue'
import Button from '~/components/ui/button/Button.vue'
import Input from '~/components/ui/input/Input.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { showToast } = useAlert()

// Fetch tags
const { data: tags, pending, error, refresh } = await useAsyncData(
  'tags',
  () => $fetch('/api/admin/tags'),
  { default: () => [] },
)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => {
  if (!tags.value) return 1
  return Math.ceil(tags.value.length / itemsPerPage)
})

const paginatedTags = computed(() => {
  if (!tags.value) return []
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return tags.value.slice(startIndex, startIndex + itemsPerPage)
})

// Create
const newTagName = ref('')
const handleCreateTag = async () => {
  if (!newTagName.value.trim()) return
  try {
    await $fetch('/api/admin/tags', {
      method: 'POST',
      body: { name: newTagName.value.trim() },
    })
    showToast('成功', 'タグが作成されました。')
    newTagName.value = ''
    await refresh()
  }
  catch (error: any) {
    showToast('エラー', error.data?.message || 'タグの作成に失敗しました。', 'error')
  }
}

</script>

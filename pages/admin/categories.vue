<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">カテゴリ管理</h1>

    <!-- New Category Form -->
    <div class="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">新規カテゴリ作成</h2>
      <form @submit.prevent="handleCreateCategory">
        <div class="flex items-center gap-4">
          <UiFormInput
            v-model="newCategoryName"
            placeholder="カテゴリ名"
            required
            class="flex-grow"
          />
          <UiButton type="submit" :disabled="pending" class="whitespace-nowrap">
            {{ pending ? '作成中...' : '作成' }}
          </UiButton>
        </div>
      </form>
    </div>

    <!-- Categories Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">名前</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">作成日時</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">アクション</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
          <tr v-if="!categories || categories.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">カテゴリが見つかりません。</td>
          </tr>
          <tr v-for="category in categories" :key="category.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ category.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ category.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ new Date(category.created_at).toLocaleString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <UiButton variant="outline" size="sm" @click="openEditModal(category)">編集</UiButton>
              <UiButton variant="destructive" size="sm" @click="handleDeleteCategory(category.id)">削除</UiButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <div v-if="isEditModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">カテゴリを編集</h2>
        <form @submit.prevent="handleUpdateCategory">
          <div class="space-y-4">
            <UiFormInput
              v-model="editingCategoryName"
              placeholder="カテゴリ名"
              required
            />
            <div class="flex justify-end gap-4">
              <UiButton type="button" variant="ghost" @click="closeEditModal">キャンセル</UiButton>
              <UiButton type="submit" :disabled="pending">
                {{ pending ? '更新中...' : '更新' }}
              </UiButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Category } from '~/types/product'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { showToast } = useAlert()

// Fetch categories
const { data: categories, pending, error, refresh } = await useAsyncData(
  'categories',
  () => $fetch('/api/admin/categories'),
  { default: () => [] },
)

// Create
const newCategoryName = ref('')
const handleCreateCategory = async () => {
  if (!newCategoryName.value.trim()) return
  try {
    await $fetch('/api/admin/categories', {
      method: 'POST',
      body: { name: newCategoryName.value.trim() },
    })
    showToast({ title: '成功', description: 'カテゴリが作成されました。' })
    newCategoryName.value = ''
    await refresh()
  }
  catch (error: any) {
    showToast({ title: 'エラー', description: error.data?.message || 'カテゴリの作成に失敗しました。', variant: 'destructive' })
  }
}

// Edit Modal
const isEditModalOpen = ref(false)
const editingCategory = ref<Category | null>(null)
const editingCategoryName = ref('')

const openEditModal = (category: Category) => {
  editingCategory.value = category
  editingCategoryName.value = category.name
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  editingCategory.value = null
  editingCategoryName.value = ''
}

// Update
const handleUpdateCategory = async () => {
  if (!editingCategory.value || !editingCategoryName.value.trim()) return
  try {
    await $fetch(`/api/admin/categories/${editingCategory.value.id}`, {
      method: 'PUT',
      body: { name: editingCategoryName.value.trim() },
    })
    showToast({ title: '成功', description: 'カテゴリが更新されました。' })
    closeEditModal()
    await refresh()
  }
  catch (error: any) {
    showToast({ title: 'エラー', description: error.data?.message || 'カテゴリの更新に失敗しました。', variant: 'destructive' })
  }
}

// Delete
const handleDeleteCategory = async (id: number) => {
  if (!confirm('本当にこのカテゴリを削除しますか？')) return
  try {
    await $fetch(`/api/admin/categories/${id}`, {
      method: 'DELETE',
    })
    showToast({ title: '成功', description: 'カテゴリが削除されました。' })
    await refresh()
  }
  catch (error: any) {
    showToast({ title: 'エラー', description: error.data?.message || 'カテゴリの削除に失敗しました。', variant: 'destructive' })
  }
}
</script>

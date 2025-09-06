<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">タグ管理</h1>

    <!-- New Tag Form -->
    <div class="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 class="text-xl font-semibold mb-4">新規タグ作成</h2>
      <form @submit.prevent="handleCreateTag">
        <div class="flex items-center gap-4">
          <UiFormInput
            v-model="newTagName"
            placeholder="タグ名"
            required
            class="flex-grow"
          />
          <UiButton type="submit" :disabled="pending">
            {{ pending ? '作成中...' : '作成' }}
          </UiButton>
        </div>
      </form>
    </div>

    <!-- Tags Table -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
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
          <tr v-if="!tags || tags.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">タグが見つかりません。</td>
          </tr>
          <tr v-for="tag in tags" :key="tag.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ tag.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{{ tag.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{{ new Date(tag.created_at).toLocaleString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
              <UiButton variant="outline" size="sm" @click="openEditModal(tag)">編集</UiButton>
              <UiButton variant="destructive" size="sm" @click="handleDeleteTag(tag.id)">削除</UiButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Edit Modal -->
    <div v-if="isEditModalOpen" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 class="text-xl font-semibold mb-4">タグを編集</h2>
        <form @submit.prevent="handleUpdateTag">
          <div class="space-y-4">
            <UiFormInput
              v-model="editingTagName"
              placeholder="タグ名"
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
import type { Database } from '~/types/supabase';
import type { Tag } from '~/types/product';

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { showToast } = useAlert()

// Define the function to fetch tags
const fetchTags = async () => {
  const supabase = useSupabaseClient<Database>()
  const { data, error } = await supabase.from('tags').select('*').order('created_at', { ascending: false })
  if (error) {
    showToast({ title: 'エラー', description: `タグの取得に失敗しました: ${error.message}`, variant: 'destructive' })
    return []
  }
  return data
}

// Fetch tags using the defined function
const { data: tags, pending, error, refresh } = await useAsyncData('tags', fetchTags, {
  default: () => [],
})

// Create
const newTagName = ref('')
const handleCreateTag = async () => {
  if (!newTagName.value.trim()) return
  const supabase = useSupabaseClient<Database>()
  try {
    const { error } = await supabase.from('tags').insert({ name: newTagName.value.trim() })
    if (error) throw error
    showToast({ title: '成功', description: 'タグが作成されました。' })
    newTagName.value = ''
    await refresh()
  } catch (error: any) {
    showToast({ title: 'エラー', description: error.message, variant: 'destructive' })
  }
}

// Edit Modal
const isEditModalOpen = ref(false)
const editingTag = ref<Tag | null>(null)
const editingTagName = ref('')

const openEditModal = (tag: Tag) => {
  editingTag.value = tag
  editingTagName.value = tag.name
  isEditModalOpen.value = true
}

const closeEditModal = () => {
  isEditModalOpen.value = false
  editingTag.value = null
  editingTagName.value = ''
}

// Update
const handleUpdateTag = async () => {
  if (!editingTag.value || !editingTagName.value.trim()) return
  const supabase = useSupabaseClient<Database>()
  try {
    const { error } = await supabase
      .from('tags')
      .update({ name: editingTagName.value.trim() })
      .eq('id', editingTag.value.id)
    if (error) throw error
    showToast({ title: '成功', description: 'タグが更新されました。' })
    closeEditModal()
    await refresh()
  } catch (error: any) {
    showToast({ title: 'エラー', description: error.message, variant: 'destructive' })
  }
}

// Delete
const handleDeleteTag = async (id: number) => {
  if (!confirm('本当にこのタグを削除しますか？')) return
  const supabase = useSupabaseClient<Database>()
  try {
    const { error } = await supabase.from('tags').delete().eq('id', id)
    if (error) throw error
    showToast({ title: '成功', description: 'タグが削除されました。' })
    await refresh()
  } catch (error: any) {
    showToast({ title: 'エラー', description: error.message, variant: 'destructive' })
  }
}
</script>

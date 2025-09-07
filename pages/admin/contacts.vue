<script setup lang="ts">
import type { Database } from '~/types/database.types'
import { format } from 'date-fns'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const supabase = useSupabaseClient<Database>()
const selectedContact = ref<any>(null)
const isModalOpen = ref(false)

const { data: contacts, refresh } = await useAsyncData(
  'contacts',
  async () => {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })
    return data
  },
)

const openModal = async (contact: any) => {
  selectedContact.value = contact
  isModalOpen.value = true
  if (!contact.is_read) {
    await supabase
      .from('contacts')
      .update({ is_read: true })
      .eq('id', contact.id)
    await refresh()
  }
}

const closeModal = () => {
  isModalOpen.value = false
  selectedContact.value = null
}

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return format(new Date(dateString), 'yyyy/MM/dd HH:mm')
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">お問い合わせ管理</h1>
    <div class="bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
      <table class="min-w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              受信日時
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              名前
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              件名
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              ステータス
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-600">
          <tr v-if="!contacts || contacts.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">お問い合わせが見つかりません。</td>
          </tr>
          <tr v-for="contact in contacts" :key="contact.id" @click="openModal(contact)" class="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(contact.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {{ contact.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              {{ contact.subject }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span :class="contact.is_read ? 'text-gray-500 dark:text-gray-400' : 'text-green-500 font-bold'">
                {{ contact.is_read ? '既読' : '未読' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen && selectedContact" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-lg">
        <h2 class="text-xl font-semibold mb-4">お問い合わせ詳細</h2>
        <div class="space-y-2 text-sm">
          <p><strong class="font-semibold text-gray-600 dark:text-gray-400">受信日時:</strong> <span class="text-gray-800 dark:text-gray-200">{{ formatDate(selectedContact.created_at) }}</span></p>
          <p><strong class="font-semibold text-gray-600 dark:text-gray-400">名前:</strong> <span class="text-gray-800 dark:text-gray-200">{{ selectedContact.name }}</span></p>
          <p><strong class="font-semibold text-gray-600 dark:text-gray-400">Email:</strong> <span class="text-gray-800 dark:text-gray-200">{{ selectedContact.email }}</span></p>
          <p><strong class="font-semibold text-gray-600 dark:text-gray-400">件名:</strong> <span class="text-gray-800 dark:text-gray-200">{{ selectedContact.subject }}</span></p>
          <hr class="my-4 dark:border-gray-600">
          <p class="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{{ selectedContact.message }}</p>
        </div>
        <div class="flex justify-end gap-4 mt-6">
          <UiButton type="button" variant="ghost" @click="closeModal">閉じる</UiButton>
        </div>
      </div>
    </div>
  </div>
</template>

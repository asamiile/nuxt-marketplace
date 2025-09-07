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
  return format(new Date(dateString), 'yyyy/MM/dd HH:mm')
}
</script>

<template>
  <div>
    <h1 class="text-2xl font-bold mb-4">お問い合わせ管理</h1>
    <div class="bg-white shadow-md rounded-lg overflow-hidden">
      <table class="min-w-full leading-normal">
        <thead>
          <tr>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              受信日時
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              名前
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              件名
            </th>
            <th class="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              ステータス
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="contact in contacts" :key="contact.id" @click="openModal(contact)" class="cursor-pointer hover:bg-gray-100">
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ formatDate(contact.created_at) }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ contact.name }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <p class="text-gray-900 whitespace-no-wrap">{{ contact.subject }}</p>
            </td>
            <td class="px-5 py-5 border-b border-gray-200 bg-white text-sm">
              <span :class="contact.is_read ? 'text-gray-500' : 'text-green-500 font-bold'">
                {{ contact.is_read ? '既読' : '未読' }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal -->
    <div v-if="isModalOpen" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" @click="closeModal">
          <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              お問い合わせ詳細
            </h3>
            <div class="mt-4">
              <p><strong class="font-semibold">受信日時:</strong> {{ formatDate(selectedContact.created_at) }}</p>
              <p><strong class="font-semibold">名前:</strong> {{ selectedContact.name }}</p>
              <p><strong class="font-semibold">Email:</strong> {{ selectedContact.email }}</p>
              <p><strong class="font-semibold">件名:</strong> {{ selectedContact.subject }}</p>
              <hr class="my-4">
              <p class="text-sm text-gray-800 whitespace-pre-wrap">{{ selectedContact.message }}</p>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button @click="closeModal" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

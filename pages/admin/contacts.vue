<script setup lang="ts">
import { ref, computed } from 'vue'
import { format } from 'date-fns'
import type { Contact } from '~/types/product'
import UiPagination from '~/components/ui/Pagination.vue'
import UiButton from '~/components/ui/button/Button.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { data: contacts, pending, error } = await useAsyncData(
  'contacts',
  () => $fetch('/api/admin/contacts'),
  {
    default: () => [],
  },
)

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10

const totalPages = computed(() => {
  if (!contacts.value) return 1
  return Math.ceil(contacts.value.length / itemsPerPage)
})

const paginatedContacts = computed(() => {
  if (!contacts.value) return []
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return contacts.value.slice(startIndex, startIndex + itemsPerPage)
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return format(new Date(dateString), 'yyyy/MM/dd HH:mm')
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">お問い合わせ管理</h1>
    <div class="bg-white dark:bg-gray-800 rounded-lg overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
              ID
            </th>
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
          <tr v-if="pending">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">読み込み中...</td>
          </tr>
          <tr v-else-if="error || !paginatedContacts || paginatedContacts.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500 dark:text-gray-400">お問い合わせが見つかりません。</td>
          </tr>
          <tr v-for="contact in paginatedContacts" :key="contact.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              <NuxtLink :to="`/admin/contacts/${contact.id}`" class="text-blue-600 hover:underline dark:text-blue-400">
                {{ contact.id }}
              </NuxtLink>
            </td>
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
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', contact.is_read ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800']">
                {{ contact.is_read ? '既読' : '未読' }}
              </span>
            </td>
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

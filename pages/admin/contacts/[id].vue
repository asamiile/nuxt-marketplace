<script setup lang="ts">
import { useRoute } from 'vue-router'
import { format } from 'date-fns'
import type { Contact } from '~/types/product'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const { showToast } = useAlert()
const contactId = route.params.id as string

const { data: contact, pending, error, refresh } = await useFetch<Contact>(`/api/admin/contacts/${contactId}`, {
  async onResponse({ response }) {
    if (response.ok && response._data && !response._data.is_read) {
      // Mark as read
      try {
        await $fetch(`/api/admin/contacts/${contactId}`, { method: 'PUT' })
        // We don't need to refresh the data, just update the local state for the badge
        if (response._data) {
          response._data.is_read = true
        }
      } catch (e) {
        console.error('Failed to mark contact as read', e)
        showToast({ title: 'エラー', description: 'ステータスの更新に失敗しました。', variant: 'destructive' })
      }
    }
  },
  onResponseError: ({ response }) => {
    showToast({
      title: 'エラー',
      description: 'お問い合わせデータの取得に失敗しました。',
      variant: 'destructive',
    })
  }
})

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'yyyy/MM/dd HH:mm')
}
</script>

<template>
  <div>
    <div v-if="pending">
      <p>読み込み中...</p>
    </div>
    <div v-else-if="error">
      <p>お問い合わせデータが見つかりません。</p>
    </div>
    <div v-else-if="contact">
      <div class="flex justify-between items-start">
        <h1 class="text-3xl font-bold mb-2">
          お問い合わせ詳細: #{{ contact.id }}
        </h1>
        <span :class="['px-3 py-1 text-sm leading-5 font-semibold rounded-full', contact.is_read ? 'bg-gray-100 text-gray-800' : 'bg-green-100 text-green-800']">
          {{ contact.is_read ? '既読' : '未読' }}
        </span>
      </div>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-6">件名: {{ contact.subject }}</p>

      <div class="text-card-foreground bg-card rounded-lg p-4 md:p-6 space-y-6">
        <!-- Contact Info -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b">
          <div>
            <h3 class="font-semibold">名前</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ contact.name }}</p>
          </div>
          <div>
            <h3 class="font-semibold">Email</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ contact.email }}</p>
          </div>
          <div>
            <h3 class="font-semibold">受信日時</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ formatDate(contact.created_at) }}</p>
          </div>
        </div>

        <!-- Message -->
        <div>
          <h3 class="font-semibold mb-2">メッセージ本文</h3>
          <div class="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-900/50 p-4 rounded-md whitespace-pre-wrap">
            {{ contact.message }}
          </div>
        </div>
      </div>
       <div class="mt-6">
        <NuxtLink to="/admin/contacts" class="text-sm text-blue-600 hover:underline dark:text-blue-400">
          &larr; お問い合わせ一覧に戻る
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

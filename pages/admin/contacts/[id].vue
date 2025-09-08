<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { format } from 'date-fns'
import type { Contact } from '~/types/contact'
import UiSelect from '~/components/ui/form/Select.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const { showToast } = useAlert()
const contactId = route.params.id as string

const { data: contact, pending, error, refresh } = await useFetch<Contact>(`/api/admin/contacts/${contactId}`, {
  onResponseError: ({ response }) => {
    showToast('エラー', 'お問い合わせデータの取得に失敗しました。', 'error')
  },
})

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A'
  return format(new Date(dateString), 'yyyy/MM/dd HH:mm')
}

const statusOptions = ['未対応', '対応中', '対応済み']
const selectedStatus = ref(contact.value?.status)

// data.valueが変更されたときにselectedStatusを更新
watch(contact, (newContact) => {
  if (newContact) {
    selectedStatus.value = newContact.status
  }
}, { immediate: true })

const updateStatus = async () => {
  if (!selectedStatus.value) return

  try {
    await $fetch(`/api/admin/contacts/${contactId}`, {
      method: 'PUT',
      body: { status: selectedStatus.value },
    })
    showToast('成功', 'ステータスを更新しました。')
    await refresh() // データを再取得して表示を最新化
  } catch (e) {
    console.error('Failed to update status', e)
    showToast('エラー', 'ステータスの更新に失敗しました。', 'error')
    // エラーが発生した場合、UIを元の状態に戻す
    await refresh()
  }
}

const getStatusClass = (status: string | undefined) => {
  if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  switch (status) {
    case '未対応':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    case '対応中':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    case '対応済み':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
  }
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
        <div class="flex items-center gap-4">
          <span :class="['px-3 py-1 text-sm leading-5 font-semibold rounded-full', getStatusClass(contact?.status)]">
            {{ contact?.status }}
          </span>
           <div class="w-40">
            <UiSelect
              v-if="selectedStatus"
              v-model="selectedStatus"
              @change="updateStatus"
            >
              <option v-for="s in statusOptions" :key="s" :value="s">{{ s }}</option>
            </UiSelect>
          </div>
        </div>
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
          <div>
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

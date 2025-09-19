<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { format } from 'date-fns'
import type { Contact } from '~/types/contact'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select'
import AdminCard from '~/components/admin/AdminCard.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const { showToast } = useAlert()
const contactId = route.params.id as string

const { data: contact, pending, error, refresh } = await useFetch<Contact>(`/api/admin/contacts/${contactId}`, {
  onResponseError: ({ response }) => {
    showToast({ title: 'エラー', description: 'お問い合わせデータの取得に失敗しました。', variant: 'error' })
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
    showToast({ title: '成功', description: 'ステータスを更新しました。' })
    await refresh() // データを再取得して表示を最新化
  } catch (e) {
    console.error('Failed to update status', e)
    showToast({ title: 'エラー', description: 'ステータスの更新に失敗しました。', variant: 'error' })
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
      <div class="flex flex-col justify-between items-start md:flex-row gap-4 mb-6">
        <h1 class="text-3xl font-bold">
          お問い合わせ詳細: #{{ contact.id }}
        </h1>
        <div class="flex items-center gap-4">
          <span :class="['px-3 py-1 text-sm leading-5 font-semibold rounded-full', getStatusClass(contact?.status)]">
            {{ contact?.status }}
          </span>
           <div class="w-40">
            <Select
              v-if="selectedStatus"
              v-model="selectedStatus"
              @update:modelValue="updateStatus"
            >
              <SelectTrigger>
                <SelectValue placeholder="ステータスを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="s in statusOptions" :key="s" :value="s">{{ s }}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      <p class="text-sm text-muted-foreground mb-6">件名: {{ contact.subject }}</p>

      <AdminCard title="お問い合わせ内容">
        <div class="space-y-6">
          <!-- Contact Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-border">
            <div>
              <h3 class="font-semibold mb-2">名前</h3>
              <p class="text-sm text-muted-foreground">{{ contact.name }}</p>
            </div>
            <div>
              <h3 class="font-semibold mb-2">Email</h3>
              <p class="text-sm text-muted-foreground">{{ contact.email }}</p>
            </div>
            <div>
              <h3 class="font-semibold mb-2">受信日時</h3>
              <p class="text-sm text-muted-foreground">{{ formatDate(contact.created_at) }}</p>
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
      </AdminCard>
       <div class="mt-6">
        <NuxtLink to="/admin/contacts" class="text-sm text-link hover:underline">
          &larr; お問い合わせ一覧に戻る
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

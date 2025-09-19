<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { format } from 'date-fns'
import type { Contact } from '~/types/contact'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import { Button } from '~/components/ui/button'
import Input from '~/components/ui/input/Input.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const searchQuery = ref('')
const { data: contacts, pending, error } = await useFetch(
  '/api/admin/contacts',
  {
    query: { q: searchQuery },
    watch: [searchQuery],
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

watch(searchQuery, () => {
  currentPage.value = 1
})

const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return format(new Date(dateString), 'yyyy/MM/dd HH:mm')
}

const getStatusClass = (status: string) => {
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
    <div class="flex flex-col justify-between items-start md:flex-row gap-4 mb-6">
      <h1 class="text-3xl font-bold">お問い合わせ管理</h1>
    </div>
    <div class="mb-4">
      <Input
        v-model="searchQuery"
        placeholder="名前、件名、内容などで検索..."
        class="max-w-sm"
      />
    </div>
    <div class="bg-card rounded-lg overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-secondary">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              ID
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              受信日時
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              名前
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              件名
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
              ステータス
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-if="pending">
            <td colspan="5" class="px-6 py-4 text-center text-muted-foreground">読み込み中...</td>
          </tr>
          <tr v-else-if="error || !paginatedContacts || paginatedContacts.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-muted-foreground">お問い合わせが見つかりません。</td>
          </tr>
          <tr v-for="contact in paginatedContacts" :key="contact.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
              <NuxtLink :to="`/admin/contacts/${contact.id}`" class="text-link hover:underline">
                {{ contact.id }}
              </NuxtLink>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
              {{ formatDate(contact.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
              {{ contact.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-foreground">
              {{ contact.subject }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', getStatusClass(contact.status)]">
                {{ contact.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="mt-6 flex justify-center">
      <Pagination
        v-slot="{ page }"
        v-model:page="currentPage"
        :total="contacts?.length || 0"
        :items-per-page="itemsPerPage"
        :sibling-count="1"
        show-edges
      >
        <PaginationContent v-slot="{ items }" class="flex items-center gap-1">
          <PaginationFirst />
          <PaginationPrevious />

          <template v-for="(item, index) in items">
            <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
              <Button class="w-9 h-9 p-0" :variant="item.value === page ? 'default' : 'outline'">
                {{ item.value }}
              </Button>
            </PaginationItem>
            <PaginationEllipsis v-else :key="item.type" :index="index" />
          </template>

          <PaginationNext />
          <PaginationLast />
        </PaginationContent>
      </Pagination>
    </div>
  </div>
</template>

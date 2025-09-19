<template>
  <div>
    <div class="flex flex-col justify-between items-start md:flex-row gap-4 mb-6">
      <h1 class="text-3xl font-bold">カテゴリ管理</h1>
    </div>

    <div class="mb-4">
      <Input
        v-model="searchQuery"
        placeholder="カテゴリ名で検索..."
        class="max-w-sm"
      />
    </div>

    <!-- New Category Form -->
    <div class="mb-8 p-4 bg-card rounded-lg">
      <h2 class="text-xl font-semibold mb-4">新規カテゴリ作成</h2>
      <form @submit.prevent="handleCreateCategory">
        <div class="flex items-center gap-4">
          <Input
            v-model="newCategoryName"
            placeholder="カテゴリ名"
            required
            class="flex-grow"
          />
          <Button type="submit" :disabled="pending" class="whitespace-nowrap">
            {{ pending ? '作成中...' : '作成' }}
          </Button>
        </div>
      </form>
    </div>

    <!-- Categories Table -->
    <div class="bg-card rounded-lg overflow-x-auto">
      <table class="min-w-full">
        <thead class="bg-secondary">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">名前</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">ステータス</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">作成日時</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border">
          <tr v-if="pending">
            <td colspan="4" class="px-6 py-4 text-center text-muted-foreground">読み込み中...</td>
          </tr>
          <tr v-else-if="error || !paginatedCategories || paginatedCategories.length === 0">
            <td colspan="4" class="px-6 py-4 text-center text-muted-foreground">カテゴリが見つかりません。</td>
          </tr>
          <tr v-for="category in paginatedCategories" :key="category.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
              <NuxtLink :to="`/admin/categories/${category.id}`" class="text-link hover:underline">
                {{ category.id }}
              </NuxtLink>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{{ category.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', category.is_public ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                {{ category.is_public ? '公開' : '非公開' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{{ new Date(category.created_at).toLocaleString() }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="totalPages > 1" class="mt-6 flex justify-center">
      <Pagination
        v-slot="{ page }"
        v-model:page="currentPage"
        :total="categories?.length || 0"
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

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Category } from '~/types/product'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '~/components/ui/pagination'
import Button from '~/components/ui/button/Button.vue'
import Input from '~/components/ui/input/Input.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { showToast } = useAlert()
const searchQuery = ref('')

// Fetch categories
const { data: categories, pending, error, refresh } = await useFetch(
  '/api/admin/categories',
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
  if (!categories.value) return 1
  return Math.ceil(categories.value.length / itemsPerPage)
})

const paginatedCategories = computed(() => {
  if (!categories.value) return []
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return categories.value.slice(startIndex, startIndex + itemsPerPage)
})

// Reset page to 1 when search query changes
watch(searchQuery, () => {
  currentPage.value = 1
})


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
    showToast({ title: 'エラー', description: error.data?.message || 'カテゴリの作成に失敗しました。', variant: 'error' })
  }
}

</script>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Category } from '~/types/product'
import Input from '~/components/ui/form/Input.vue'
import { buttonVariants } from '~/components/ui/button/buttonVariants'

const props = defineProps<{
  categories: Category[]
}>()

const emit = defineEmits(['update:filters'])

const isFiltersVisible = ref(false)

const filters = ref({
  keyword: '',
  categoryId: null,
  minPrice: null,
  maxPrice: null,
})

watch(filters, (newFilters) => {
  emit('update:filters', { ...newFilters })
}, { deep: true })

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.keyword) count++
  if (filters.value.categoryId !== null) count++
  if (filters.value.minPrice !== null) count++
  if (filters.value.maxPrice !== null) count++
  return count
})
</script>

<template>
  <div class="mb-6">
    <button
      @click="isFiltersVisible = !isFiltersVisible"
      :class="buttonVariants({ variant: 'outline', class: 'w-full sm:w-auto mb-4' })"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4 mr-2"><path d="M22 3h-5l-5.15-2.06a1 1 0 0 0-.85 0L6 3H1a1 1 0 0 0-1 1v2c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V4a1 1 0 0 0-1-1Z"/><path d="M1.3 7.56c.9 1.14 2.45 1.94 4.45 1.94s3.55-.8 4.45-1.94c.9 1.14 2.45 1.94 4.45 1.94s3.55-.8 4.45-1.94"/></svg>
      <span>絞り込み</span>
      <span v-if="activeFilterCount > 0" class="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs">
        {{ activeFilterCount }}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="['h-4 w-4 ml-2 transition-transform', isFiltersVisible ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
    </button>

    <div v-if="isFiltersVisible" class="p-4 border rounded-lg bg-secondary">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:flex items-end gap-4">
        <div class="filter-group flex-grow">
          <label for="keyword-search" class="text-sm font-medium">キーワード</label>
          <Input
            id="keyword-search"
            v-model="filters.keyword"
            type="text"
            placeholder="キーワードで検索..."
            class="w-full mt-1 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>
        <div class="filter-group">
          <label for="category-select" class="text-sm font-medium">カテゴリ</label>
          <select
            id="category-select"
            v-model="filters.categoryId"
            :class="['flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mt-1', filters.categoryId === null ? 'text-muted-foreground' : 'text-foreground']"
          >
            <option :value="null">すべてのカテゴリ</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
        </div>
        <div class="flex gap-4">
          <div class="filter-group md:w-32">
            <label for="min-price" class="text-sm font-medium">最低価格</label>
            <Input
              id="min-price"
              v-model.number="filters.minPrice"
              type="number"
              placeholder="¥"
              class="w-full mt-1"
            />
          </div>
          <div class="filter-group md:w-32">
            <label for="max-price" class="text-sm font-medium">最高価格</label>
            <Input
              id="max-price"
              v-model.number="filters.maxPrice"
              type="number"
              placeholder="¥"
              class="w-full mt-1"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
select {
    padding-right: 2.5rem;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}
</style>

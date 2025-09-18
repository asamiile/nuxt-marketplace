<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import type { Category, Tag } from '~/types/product'
import Input from '~/components/ui/input/Input.vue'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Checkbox } from '~/components/ui/checkbox'
import { buttonVariants } from '~/components/ui/button'

const props = defineProps<{
  categories: Category[]
  tags: Tag[]
}>()

const emit = defineEmits(['update:filters'])

const isFiltersVisible = ref(false)

const initialFilters = {
  keyword: '',
  categoryId: null,
  tagIds: [],
  minPrice: null,
  maxPrice: null,
}

const filters = ref({ ...initialFilters })

watch(filters, (newFilters) => {
  emit('update:filters', { ...newFilters })
}, { deep: true })

function resetFilters() {
  filters.value = { ...initialFilters }
}

function handleTagChange(tagId: number, isChecked: boolean) {
  if (isChecked) {
    if (!filters.value.tagIds.includes(tagId)) {
      filters.value.tagIds.push(tagId)
    }
  } else {
    filters.value.tagIds = filters.value.tagIds.filter(id => id !== tagId)
  }
}

const activeFilterCount = computed(() => {
  let count = 0
  if (filters.value.keyword) count++
  if (filters.value.categoryId !== null) count++
  if (filters.value.tagIds.length > 0) count++
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
      <span>絞り込み</span>
      <span v-if="activeFilterCount > 0" class="ml-2 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs">
        {{ activeFilterCount }}
      </span>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="['h-4 w-4 ml-2 transition-transform', isFiltersVisible ? 'rotate-180' : '']"><path d="m6 9 6 6 6-6"/></svg>
    </button>

    <div v-if="isFiltersVisible" class="p-4 border rounded-lg bg-secondary">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div class="filter-group">
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
          <Select v-model="filters.categoryId">
            <SelectTrigger id="category-select" class="w-full mt-1">
              <SelectValue placeholder="すべてのカテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="null">すべてのカテゴリ</SelectItem>
              <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div class="filter-group">
          <label for="min-price" class="text-sm font-medium">最低価格</label>
          <Input
            id="min-price"
            v-model.number="filters.minPrice"
            type="number"
            placeholder="¥"
            class="w-full mt-1"
          />
        </div>
        <div class="filter-group">
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
      <div class="filter-group mt-4">
        <label class="text-sm font-medium">タグ</label>
        <div class="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          <div v-for="tag in tags" :key="tag.id" class="flex items-center">
            <Checkbox
              :id="'tag-' + tag.id"
              :checked="filters.tagIds.includes(tag.id)"
              @update:checked="(isChecked) => handleTagChange(tag.id, isChecked)"
            />
            <label :for="'tag-' + tag.id" class="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {{ tag.name }}
            </label>
          </div>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          @click="resetFilters"
          :class="buttonVariants({ variant: 'ghost' })"
        >
          リセット
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>

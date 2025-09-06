<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Category } from '~/types/product'
import Input from '~/components/ui/Input.vue'

const props = defineProps<{
  categories: Category[]
}>()

const emit = defineEmits(['update:filters'])

const filters = ref({
  keyword: '',
  categoryId: null,
  minPrice: null,
  maxPrice: null,
})

watch(filters, (newFilters) => {
  emit('update:filters', { ...newFilters })
}, { deep: true })
</script>

<template>
  <div class="filters-bar grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-100 rounded-lg">
    <div class="filter-group">
      <Input
        v-model="filters.keyword"
        type="text"
        placeholder="キーワード"
        class="w-full"
      />
    </div>
    <div class="filter-group">
      <select
        v-model="filters.categoryId"
        class="w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
      >
        <option :value="null">すべてのカテゴリ</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
    </div>
    <div class="filter-group">
      <Input
        v-model.number="filters.minPrice"
        type="number"
        placeholder="最低価格"
        class="w-full"
      />
    </div>
    <div class="filter-group">
      <Input
        v-model.number="filters.maxPrice"
        type="number"
        placeholder="最高価格"
        class="w-full"
      />
    </div>
  </div>
</template>

<style scoped>
.filters-bar {
  margin-bottom: 1.5rem;
}
select {
    height: 40px;
    padding-left: 0.75rem;
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

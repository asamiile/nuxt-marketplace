<template>
  <div class="relative" ref="comboboxRef">
    <Input
      v-model="searchTerm"
      @focus="isDropdownVisible = true"
      :placeholder="placeholder"
      autocomplete="off"
      class="w-full"
    />
    <div
      v-if="isDropdownVisible && filteredItems.length > 0"
      class="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg"
    >
      <ul class="py-1 max-h-60 overflow-auto">
        <li
          v-for="item in filteredItems"
          :key="item.id"
          @click="selectItem(item)"
          class="px-3 py-2 cursor-pointer hover:bg-muted"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
    <div
      v-else-if="isDropdownVisible && searchTerm && filteredItems.length === 0"
      class="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-lg"
    >
      <p class="px-3 py-2 text-muted-foreground">見つかりませんでした。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import Input from '~/components/ui/input/Input.vue'
import type { Tag } from '~/types/product';

// Props
const props = defineProps<{
  items: Tag[]
  placeholder?: string
}>()

// Emits
const emit = defineEmits(['select'])

// --- State ---
const searchTerm = ref('')
const isDropdownVisible = ref(false)
const comboboxRef = ref<HTMLElement | null>(null)

// --- Computed ---
const filteredItems = computed(() => {
  if (!searchTerm.value) {
    return props.items
  }
  return props.items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.value.toLowerCase())
  )
})

// --- Methods ---
const selectItem = (item: Tag) => {
  emit('select', item)
  searchTerm.value = ''
  isDropdownVisible.value = false
}

const handleClickOutside = (event: MouseEvent) => {
  if (comboboxRef.value && !comboboxRef.value.contains(event.target as Node)) {
    isDropdownVisible.value = false
  }
}

// --- Lifecycle Hooks ---
onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside)
})
</script>

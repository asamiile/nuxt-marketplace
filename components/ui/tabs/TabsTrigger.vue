<script setup lang="ts">
import { computed, inject } from 'vue'
import type { Ref } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  value: string
  class?: string
}>()

const activeTab = inject<Ref<string>>('activeTab')

const isActive = computed(() => activeTab?.value === props.value)

const handleClick = () => {
  if (activeTab) {
    activeTab.value = props.value
  }
}
</script>

<template>
  <button
    @click="handleClick"
    :class="cn(
      'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
      isActive ? 'bg-background text-foreground shadow-sm' : 'text-gray-500 hover:bg-secondary',
      props.class,
    )"
  >
    <slot />
  </button>
</template>

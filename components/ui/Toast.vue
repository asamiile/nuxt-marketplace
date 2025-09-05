<template>
  <div :class="toastClasses">
    <div class="flex-shrink-0">
      <!-- You can replace this with actual icons -->
      <span v-if="type === 'success'">✔️</span>
      <span v-if="type === 'error'">❌</span>
    </div>
    <div class="ml-3">
      <h3 class="text-sm font-medium">{{ title }}</h3>
      <p class="mt-1 text-sm">{{ description }}</p>
    </div>
    <div class="ml-auto pl-3">
      <div class="-mx-1.5 -my-1.5">
        <button
          @click="$emit('close')"
          type="button"
          class="inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
          :class="buttonClasses"
        >
          <span class="sr-only">Dismiss</span>
          <!-- Heroicon name: solid/x -->
          <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  type: {
    type: String as () => 'success' | 'error',
    required: true,
  },
})

defineEmits(['close'])

const toastClasses = computed(() => {
  const baseClasses = 'rounded-md p-4 shadow-lg flex items-start'
  if (props.type === 'success') {
    return `${baseClasses} bg-green-50 text-green-800`
  }
  return `${baseClasses} bg-red-50 text-red-800`
})

const buttonClasses = computed(() => {
  if (props.type === 'success') {
    return 'bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50'
  }
  return 'bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50'
})
</script>

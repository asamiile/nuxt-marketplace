<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  checked?: boolean
  id?: string
}>()

const emit = defineEmits(['update:checked'])

const localChecked = computed({
  get: () => props.checked,
  set: (value) => emit('update:checked', value)
})
</script>

<template>
  <input
    type="checkbox"
    :id="id"
    v-model="localChecked"
    class="peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
  />
</template>

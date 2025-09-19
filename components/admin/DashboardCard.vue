<script setup lang="ts">
interface Props {
  title: string
  value?: string | number
  unit?: string
}

defineProps<Props>()
</script>

<template>
  <div class="text-card-foreground bg-card rounded-lg p-4 md:p-6">
    <h2 class="text-xl font-semibold mb-4 border-b border-border pb-2">
      {{ title }}
    </h2>
    <div class="text-xl">
      <slot>
        {{ value }}
        <span v-if="value !== 'N/A' && unit" class="text-sm font-normal text-gray-500">{{ unit }}</span>
      </slot>
    </div>
  </div>
</template>

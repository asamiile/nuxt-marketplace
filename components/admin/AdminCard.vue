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
    <template v-if="title">
      <h2 class="text-xl font-semibold mb-4 border-b border-border pb-3">
        {{ title }}
      </h2>
    </template>
    <div>
      <slot>
        {{ value }}
      </slot>
    </div>
  </div>
</template>

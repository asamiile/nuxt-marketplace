<template>
  <div :class="cn('text-card-foreground shadow-md dark:border rounded-lg', props.class)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'
const props = defineProps<{
  class?: string
}>()
</script>
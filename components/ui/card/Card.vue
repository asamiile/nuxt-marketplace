<template>
  <div :class="cn('text-card-foreground rounded shadow-md dark:shadow-sky-500/20', props.class)">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'
const props = defineProps<{
  class?: string
}>()
</script>
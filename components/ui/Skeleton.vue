<template>
  <div :class="cn('animate-pulse rounded-md bg-muted', props.class)">
    <div class="h-48 w-full rounded-t-md bg-secondary" />
    <div class="p-4 space-y-3">
      <div class="h-6 w-3/4 rounded bg-secondary" />
      <div class="h-4 w-1/2 rounded bg-secondary" />
      <div class="h-5 w-1/4 rounded bg-secondary" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { cn } from '~/lib/utils'

interface SkeletonProps {
  class?: string
}
const props = defineProps<SkeletonProps>()
</script>

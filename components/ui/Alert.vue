<script setup lang="ts">
import { cn } from '@/lib/utils'

interface AlertProps {
  title?: string
  description?: string
  class?: string
}

const props = defineProps<AlertProps>()
</script>

<template>
  <div
    :class="cn('relative w-full rounded-lg border px-4 py-3 text-sm [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground', props.class)"
    role="alert"
  >
    <h5 v-if="title" class="mb-1 font-medium leading-none tracking-tight">
      {{ title }}
    </h5>
    <div v-if="description" class="text-sm [&_p]:leading-relaxed">
      {{ description }}
    </div>
    <slot />
  </div>
</template>

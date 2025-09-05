<script setup lang="ts">
import type { VariantProps } from 'class-variance-authority'
import { cn } from '~/lib/utils'
import { buttonVariants } from '~/components/ui/buttonVariants'
type ButtonProps = VariantProps<typeof buttonVariants>
interface Props {
  variant?: ButtonProps['variant']
  size?: ButtonProps['size']
  class?: string
}
const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'default',
})
</script>

<template>
  <button :class="cn(buttonVariants({ variant, size }), props.class)">
    <slot />
  </button>
</template>

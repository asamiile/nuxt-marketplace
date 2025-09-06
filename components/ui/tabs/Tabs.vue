<script setup lang="ts">
import { provide } from 'vue'

const modelValue = defineModel<string>()

provide('activeTab', modelValue)
</script>

<template>
  <div>
    <slot />
  </div>
</template>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { useColorMode } from '~/composables/useColorMode'

useColorMode()
</script>

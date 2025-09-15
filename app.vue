<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useSiteSettings } from '~/composables/useSiteSettings'

const { fetchSettings } = useSiteSettings()

onMounted(() => {
  fetchSettings()
})
</script>

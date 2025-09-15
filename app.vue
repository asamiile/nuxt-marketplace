<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useSiteSettings } from '~/composables/useSiteSettings'

const { fetchSettings, getSetting } = useSiteSettings()

onMounted(() => {
  fetchSettings()
})

const siteName = getSetting('site_name', 'Marketplace')
const siteDescription = getSetting('site_description', 'A wonderful marketplace application.')

useHead({
  title: siteName,
  meta: [
    { name: 'description', content: siteDescription }
  ],
})
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'NicheAssets Marketplace',
  meta: [
    { name: 'description', content: 'A marketplace for niche digital assets.' }
  ],
  bodyAttrs: {
    class: 'antialiased font-sans'
  }
})
</script>

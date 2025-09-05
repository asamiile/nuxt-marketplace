<template>
  <div class="relative flex min-h-screen flex-col">
    <TheHeader />
    <main class="flex-grow container py-10 relative">
      <slot />
    </main>
    <Toaster />
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import Toaster from '~/components/ui/Toaster.vue'
</script>

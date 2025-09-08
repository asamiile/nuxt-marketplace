<template>
  <div class="relative flex min-h-screen flex-col">
    <TheHeader />
    <main class="flex-grow container px-4 py-4 md:py-8 relative">
      <slot />
    </main>
    <Toaster />
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import Toaster from '~/components/ui/toast/Toaster.vue'
</script>

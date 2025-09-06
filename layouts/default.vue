<template>
  <div class="relative flex min-h-screen flex-col">
    <TheHeader />
    <main class="flex-grow container px-6 py-20 md:py-32 relative">
      <slot />
    </main>
    <Toaster />
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import Toaster from '~/components/ui/toast/Toaster.vue'
</script>

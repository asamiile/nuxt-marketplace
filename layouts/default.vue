<template>
  <div class="relative flex min-h-screen flex-col">
    <TheHeader />
    <main class="flex-grow container mx-auto p-4 md:p-8 relative">
      <slot />
    </main>
    <TheFooter />
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import Toaster from '~/components/ui/toast/Toaster.vue'
</script>

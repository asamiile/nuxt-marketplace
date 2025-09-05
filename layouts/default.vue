<template>
  <div class="relative flex min-h-screen flex-col">
    <TheHeader />
    <main class="flex-grow container py-10 relative">
      <!-- Global Alert -->
      <div v-if="alert.show" class="fixed top-20 right-1/2 translate-x-1/2 z-50 w-full max-w-sm">
        <Alert
          :title="alert.title"
          :description="alert.message"
          :class="alert.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'"
        />
      </div>
      <slot />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import Alert from '~/components/ui/Alert.vue'
const { alert } = useAlert()
</script>

<template>
  <div class="relative flex min-h-screen flex-col">
    <TheHeader />
    <main class="flex-grow container py-10 relative">
      <!-- Global Alert -->
      <div v-if="alert.show" class="fixed top-20 right-1/2 translate-x-1/2 z-50 w-full max-w-sm">
        <Alert :variant="alert.type === 'success' ? 'success' : 'destructive'">
          <AlertTitle>{{ alert.title }}</AlertTitle>
          <AlertDescription>{{ alert.message }}</AlertDescription>
        </Alert>
      </div>
      <slot />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
import { useAlert } from '~/composables/useAlert'
import Alert from '~/components/ui/Alert.vue'
import AlertTitle from '~/components/ui/AlertTitle.vue'
import AlertDescription from '~/components/ui/AlertDescription.vue'
const { alert } = useAlert()
</script>

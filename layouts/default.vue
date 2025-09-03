<template>
  <div class="relative flex min-h-screen flex-col bg-background">
    <TheHeader />
    <main class="flex-1">
      <slot />
    </main>
    <TheFooter />
  </div>
</template>

<script setup lang="ts">
</script>

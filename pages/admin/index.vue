<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: ['admin', () => navigateTo('/admin/products')],
})
</script>

<template>
  <div>
    <p>リダイレクト中...</p>
  </div>
</template>

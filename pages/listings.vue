<template>
  <div class="container py-8">
    <h1 class="text-3xl font-bold mb-8">あなたの出品商品</h1>
    <UserListings />
  </div>
</template>

<script setup lang="ts">
import UserListings from '~/components/dashboard/UserListings.vue'

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'あなたの出品商品',
})
</script>

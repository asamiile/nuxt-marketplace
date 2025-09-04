<template>
  <div class="container py-8">
    <h1 class="text-3xl font-bold mb-8">お気に入り商品</h1>
    <FavoriteProducts />
  </div>
</template>

<script setup lang="ts">
import FavoriteProducts from '~/components/dashboard/FavoriteProducts.vue'

definePageMeta({
  middleware: 'auth'
})

useHead({
  title: 'お気に入り商品',
})
</script>

<template>
  <div class="border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
    <NuxtLink :to="`/product/${product.id}`">
      <img :src="product.image_url" alt="Product image" class="w-full h-48 object-cover">
      <div class="p-4">
        <h3 class="font-bold text-lg truncate">{{ product.name }}</h3>
        <p class="text-gray-600 text-sm">{{ product.profiles?.username || 'Unknown Creator' }}</p>
        <p class="font-semibold mt-2">{{ formatPrice(product.price) }}</p>
      </div>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

interface ProductCardProps {
  product: Product;
}

defineProps<ProductCardProps>()

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
}
</script>

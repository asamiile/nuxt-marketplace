<template>
  <UiCard class="overflow-hidden hover:shadow-xl transition-shadow duration-300">
    <NuxtLink :to="`/product/${product.id}`">
      <img :src="product.image_url" alt="Product image" class="w-full h-48 object-cover">
      <UiCardContent class="p-4">
        <UiCardTitle class="text-lg truncate">{{ product.name }}</UiCardTitle>
        <NuxtLink v-if="product.profiles?.username" :to="`/creator/${product.profiles.username}`" @click.stop class="text-sm text-muted-foreground hover:text-primary transition-colors">
          {{ product.profiles.username }}
        </NuxtLink>
        <p v-else class="text-sm text-muted-foreground">Unknown Creator</p>
        <p class="font-semibold mt-2">{{ formatPrice(product.price) }}</p>
      </UiCardContent>
    </NuxtLink>
  </UiCard>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

interface ProductCardProps {
  product: Product;
}

defineProps<ProductCardProps>()

const formatPrice = (price: number | null) => {
  if (price === null) return ''
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
}
</script>

<template>
  <div class="border-border border rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card relative">
    <NuxtLink :to="`/product/${product.id}`">
      <img :src="product.image_url" alt="Product image" class="w-full h-48 object-cover">
      <div class="p-4">
        <h3 class="font-bold text-lg truncate text-card-foreground">{{ product.name }}</h3>
        <p class="text-card-foreground/80 text-sm">{{ product.profiles?.username || 'Unknown Creator' }}</p>
        <p class="font-semibold mt-2 text-card-foreground">{{ formatPrice(product.price) }}</p>
      </div>
    </NuxtLink>
    <button
      @click.prevent="toggleFavorite"
      class="absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors"
      aria-label="Toggle Favorite"
    >
      <span :class="{'text-red-500': isFavoritedState, 'text-gray-300': !isFavoritedState}">❤️</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Product } from '~/types/product'
import { useFavorites } from '~/composables/useFavorites'

interface ProductCardProps {
  product: Product;
}

const props = defineProps<ProductCardProps>()

const { isFavorited, addFavorite, removeFavorite } = useFavorites()
const isFavoritedState = ref(false)
const user = useCurrentUser();

onMounted(async () => {
  if (user.value) {
    isFavoritedState.value = await isFavorited(props.product.id)
  }
})

const toggleFavorite = async () => {
  if (!user.value) {
    // Or redirect to login, show a message, etc.
    alert('Please log in to favorite items.')
    return
  }

  isFavoritedState.value = !isFavoritedState.value
  if (isFavoritedState.value) {
    await addFavorite(props.product.id)
  } else {
    await removeFavorite(props.product.id)
  }
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
}
</script>

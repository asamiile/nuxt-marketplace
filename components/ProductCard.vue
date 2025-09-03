<template>
  <UiCard class="overflow-hidden hover:shadow-xl transition-shadow duration-300 relative">
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
    <ClientOnly>
      <button
        @click.prevent="toggleFavorite"
        class="absolute top-2 right-2 p-1 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-75 transition-colors z-10"
        aria-label="Toggle Favorite"
      >
        <span :class="{'text-red-500': isFavoritedState, 'text-gray-300': !isFavoritedState}">❤️</span>
      </button>
    </ClientOnly>
  </UiCard>
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

const formatPrice = (price: number | null) => {
  if (price === null) return ''
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
}
</script>

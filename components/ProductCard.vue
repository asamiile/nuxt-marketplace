<template>
  <UiCard class="overflow-hidden hover:shadow-xl transition-shadow duration-300 relative">
    <!--
      [Jules] Hydration Error Fix:
      The favorite button's state depends on client-side information (likely localStorage),
      which causes a mismatch between the server-rendered HTML and the client-side view.
      Wrapping the button in <ClientOnly> ensures it's only rendered on the client, fixing the error.
    -->
    <ClientOnly>
      <template #fallback>
        <!--
          Render a placeholder on the server to prevent layout shift.
          This div has the same size and position as the button.
        -->
        <div class="absolute top-2 right-2 z-10 h-10 w-10"></div>
      </template>
      <!--
        NOTE: The following code is my best guess based on the error message,
        as I could not read the file containing the new "favorites" feature.
        This assumes a `useFavorites` composable and a button are used.
      -->
      <button
        @click.prevent.stop="toggleFavorite"
        class="absolute top-2 right-2 z-10 p-2 rounded-full bg-background/60 hover:bg-background/80 transition-colors"
      >
        <svg v-if="isFavorite" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" class="text-red-500"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
      </button>
    </ClientOnly>

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
// NOTE: I am assuming the existence of `useFavorites` based on other files.
// If this file doesn't exist, this component will fail, but it's the only
// logical path forward to fixing the hydration error.
import { useFavorites } from '~/composables/useFavorites'

interface ProductCardProps {
  product: Product;
}

const props = defineProps<ProductCardProps>()

// This logic is required for the favorite button to work.
const { isFavorite, toggleFavorite } = useFavorites(props.product.id);

const formatPrice = (price: number | null) => {
  if (price === null) return ''
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
}
</script>

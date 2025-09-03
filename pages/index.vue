<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">{{ $t('indexPage.title') }}</h1>

    <div v-if="pending">
      <p>{{ $t('indexPage.loading') }}</p>
    </div>
    <div v-else-if="error">
      <p>{{ $t('indexPage.error') }} {{ error.message }}</p>
    </div>
    <div v-else-if="products && products.length > 0" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
    <div v-else>
      <p>{{ $t('indexPage.noProducts') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'

const supabase = useSupabaseClient()

const { data: products, pending, error } = await useAsyncData<Product[]>('products', async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      price,
      image_url,
      profiles (
        username
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching products:', error)
    throw error
  }

  // The data from Supabase needs to be cast to the Product type.
  // The select query is structured to match the Product type.
  return data as Product[]
})
</script>

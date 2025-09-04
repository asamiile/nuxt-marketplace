<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-2xl font-semibold text-foreground">あなたの出品商品</h2>
      <NuxtLink to="/sell" :class="buttonVariants()">
        新しい商品を出品する
      </NuxtLink>
    </div>
    <div v-if="pending">
      <p>読み込み中...</p>
    </div>
    <div v-else-if="data && data.products && data.products.length > 0">
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <ProductCard v-for="product in data.products" :key="product.id" :product="product" />
      </div>
      <div class="mt-8">
        <Pagination
          v-if="data.totalPages > 1"
          v-model:currentPage="currentPage"
          :total-pages="data.totalPages"
        />
      </div>
    </div>
    <div v-else class="text-center py-12 bg-secondary rounded-lg">
      <h2 class="text-xl font-semibold text-foreground">商品はまだありません。</h2>
      <p class="mt-2 text-foreground">最初の商品を出品して、販売を始めましょう！</p>
      <NuxtLink to="/sell" :class="buttonVariants({ class: 'mt-6' })">
        出品ページへ
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Product } from '~/types/product'
import { buttonVariants } from '~/components/ui/buttonVariants'
import ProductCard from '~/components/ProductCard.vue'
import Pagination from '~/components/ui/Pagination.vue'

const { showAlert } = useAlert()
const supabase = useSupabaseClient()
const user = useCurrentUser()

const itemsPerPage = 8
const currentPage = ref(1)

// Fetch user's own products for sale
const { data, pending, error, refresh } = await useAsyncData(
  `user-products-${user.value?.id}`,
  async () => {
    if (!user.value) return { products: [], totalPages: 1 }

    // Get total count of user's products
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', user.value.id)

    if (countError) {
      console.error('Error fetching user product count:', countError)
      throw countError
    }

    const totalPages = count ? Math.ceil(count / itemsPerPage) : 1

    // Fetch products for the current page
    const from = (currentPage.value - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    const { data: productsData, error: productsError } = await supabase
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
      .eq('creator_id', user.value.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (productsError) {
      console.error('Error fetching user products:', productsError)
      throw productsError
    }

    return {
      products: productsData as Product[],
      totalPages,
    }
  },
  {
    // We keep watching the user object, but we need to manually refresh
    // on page change, so we can't rely on the default watching behavior for everything.
    // The key here is that the asyncData key is unique per user, so it will refetch on user change.
    // We add a separate watcher for currentPage.
    watch: [user],
  },
)

watch(currentPage, () => {
  // We need to make sure the key of useAsyncData changes when the page changes
  // to avoid caching issues. A simple refresh() is enough if the key doesn't depend on currentPage.
  // In our case, the key is `user-products-${user.value?.id}` which is fine.
  refresh()
})

watch(error, (newError) => {
  if (newError) {
    showAlert('エラー', `出品商品の読み込みに失敗しました: ${newError.message}`, 'error')
  }
})
</script>

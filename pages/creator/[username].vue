<template>
  <div v-if="pending">
    <!-- Skeleton for Creator Info Header -->
    <div class="flex flex-col sm:flex-row items-center gap-6 mb-10 bg-secondary p-4 md:p-8 rounded-2xl">
      <Skeleton class="w-28 h-28 rounded-full border-4 border-background" />
      <div class="flex-1 space-y-3 text-center sm:text-left">
        <Skeleton class="h-8 w-48 mx-auto sm:mx-0" />
        <Skeleton class="h-4 w-full max-w-lg mx-auto sm:mx-0" />
        <Skeleton class="h-4 w-full max-w-md mx-auto sm:mx-0" />
        <div class="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 pt-2">
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-4 w-20" />
          <Skeleton class="h-4 w-20" />
        </div>
      </div>
    </div>

    <!-- Skeleton for Creator's Products -->
    <div>
      <Skeleton class="h-7 w-64 mb-6" />
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
        <Skeleton v-for="n in 8" :key="n" />
      </div>
    </div>
  </div>
  <div v-else-if="error" class="flex flex-col items-center justify-center container py-8 md:py-12 text-center">
    <h1 class="text-2xl font-bold text-red-500">エラーが発生しました</h1>
    <p class="mt-2 text-muted-foreground">クリエイターが見つかりませんでした。</p>
    <NuxtLink to="/" :class="buttonVariants({ variant: 'link', class: 'mt-4' })">
      ホームに戻る
    </NuxtLink>
  </div>
  <div v-else-if="data && data.profile">
    <!-- Creator Info Header -->
    <div class="flex flex-col sm:flex-row items-center gap-6 mb-10 bg-secondary p-4 md:p-8 rounded-2xl">
      <template v-if="data.profile.avatar_url">
        <img :src="data.profile.avatar_url" alt="Creator Avatar" class="w-28 h-28 rounded-full object-cover border-4 border-background">
      </template>
      <template v-else>
        <div class="w-28 h-28 rounded-full bg-muted flex items-center justify-center border-4 border-background">
          <span class="text-5xl text-muted-foreground">{{ data.profile.username?.charAt(0).toUpperCase() }}</span>
        </div>
      </template>

      <div class="text-center sm:text-left">
        <h1 class="text-4xl font-bold text-foreground">{{ data.profile.username }}</h1>
        <p v-if="data.profile.bio" class="mt-2 max-w-xl text-muted-foreground">{{ data.profile.bio }}</p>
        <!-- Social Links -->
        <div class="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-2 mt-4">
          <a v-if="data.profile.website_url" :href="data.profile.website_url" target="_blank" rel="noopener noreferrer" class="hover:text-sky-500 transition-colors">ウェブサイト</a>
          <a v-if="data.profile.x_url" :href="data.profile.x_url" target="_blank" rel="noopener noreferrer" class="hover:text-sky-500 transition-colors">X/Twitter</a>
          <a v-if="data.profile.youtube_url" :href="data.profile.youtube_url" target="_blank" rel="noopener noreferrer" class="hover:text-sky-500 transition-colors">YouTube</a>
        </div>
      </div>
    </div>

    <!-- Creator's Products -->
    <div>
      <h2 class="text-2xl font-semibold mb-6 text-foreground">{{ data.profile.username }}さんの商品</h2>
      <div v-if="data.products && data.products.length > 0">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
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
      <div v-else class="text-center py-12 md:py-16 bg-secondary rounded-lg">
        <h3 class="text-xl font-semibold">商品はまだありません</h3>
        <p class="mt-2 text-muted-foreground">このクリエイターはまだ商品を出品していません。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Product } from '~/types/product'
import type { Profile } from '~/types/profile'
import { buttonVariants } from '~/components/ui/button/buttonVariants'
import ProductCard from '~/components/ProductCard.vue'
import Pagination from '~/components/ui/Pagination.vue'
import Skeleton from '~/components/ui/Skeleton.vue'

const route = useRoute()
const supabase = useSupabaseClient()
const username = route.params.username as string

const itemsPerPage = 8
const currentPage = ref(1)

const { data, pending, error, refresh } = await useAsyncData(
  `creator-page-${username}`,
  async () => {
    if (!username) {
      throw createError({ statusCode: 400, statusMessage: 'Username is required' })
    }

    // 1. Fetch profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id, username, avatar_url, bio, website_url, x_url, youtube_url')
      .eq('username', username)
      .single()

    if (profileError || !profileData) {
      console.error(`Error fetching profile for ${username}:`, profileError)
      throw createError({ statusCode: 404, statusMessage: 'Creator not found' })
    }

    // 2. Get total count of products for the creator
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', profileData.id)

    if (countError) {
      console.error(`Error fetching product count for ${profileData.username}:`, countError)
      // We can still show the profile page even if the count fails.
    }

    const totalPages = count ? Math.ceil(count / itemsPerPage) : 1

    // 3. Fetch products for the current page
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
      .eq('creator_id', profileData.id)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (productsError) {
      console.error(`Error fetching products for ${profileData.username}:`, productsError)
    }

    return {
      profile: profileData as Profile,
      products: (productsData as Product[]) || [],
      totalPages,
    }
  },
  {
    watch: [],
  },
)

watch(currentPage, () => {
  refresh()
})

// Set page title
useHead({
  title: data.value?.profile?.username ? `${data.value.profile.username}のプロフィール` : 'クリエイターページ',
})
</script>

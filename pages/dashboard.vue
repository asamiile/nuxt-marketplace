<template>
  <div class="container py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-foreground">マイダッシュボード</h1>
      <NuxtLink to="/sell" :class="buttonVariants()">
        新しい商品を出品する
      </NuxtLink>
    </div>

    <!-- Profile Settings Form -->
    <div class="mb-12">
      <h2 class="text-xl font-semibold mb-4 text-foreground">プロフィール設定</h2>
      <div v-if="profileLoading" class="text-center py-12 bg-secondary rounded-lg">
        <p>プロフィールを読み込み中...</p>
      </div>
      <form v-else @submit.prevent="updateProfile" class="space-y-6 bg-secondary p-6 rounded-lg">
        <div>
          <Label for="username">ユーザー名</Label>
          <Input id="username" v-model="profile.username" type="text" class="mt-1" />
        </div>
        <div>
          <Label for="avatar_url">アバターURL</Label>
          <Input id="avatar_url" v-model="profile.avatar_url" type="text" class="mt-1" placeholder="https://..."/>
          <p class="text-sm text-muted-foreground mt-1">画像URLを入力してください。</p>
        </div>
        <div>
          <Label for="bio">自己紹介</Label>
          <Textarea id="bio" v-model="profile.bio" class="mt-1" placeholder="こんにちは！..." />
        </div>
        <div>
          <Label for="website_url">ウェブサイトURL</Label>
          <Input id="website_url" v-model="profile.website_url" type="url" class="mt-1" placeholder="https://..."/>
        </div>
        <div>
          <Label for="x_url">X (Twitter) URL</Label>
          <Input id="x_url" v-model="profile.x_url" type="url" class="mt-1" placeholder="https://x.com/..."/>
        </div>
        <div>
          <Label for="youtube_url">YouTube URL</Label>
          <Input id="youtube_url" v-model="profile.youtube_url" type="url" class="mt-1" placeholder="https://youtube.com/..."/>
        </div>
        <div>
          <Button type="submit" :disabled="saving">
            {{ saving ? '保存中...' : 'プロフィールを更新' }}
          </Button>
        </div>
      </form>
    </div>

    <!-- Favorite Products Section -->
    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-4 text-foreground">お気に入り商品</h2>
      <div v-if="favoritesLoading">
        <p>お気に入りを読み込んでいます...</p>
      </div>
      <div v-else-if="favoriteProducts && favoriteProducts.length > 0">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard v-for="product in favoriteProducts" :key="`fav-${product.id}`" :product="product" />
        </div>
      </div>
      <div v-else class="text-center py-10 bg-secondary rounded-lg">
        <p class="text-foreground">お気に入りに登録した商品はまだありません。</p>
      </div>
    </div>

    <!-- Your Products Section -->
    <div class="border-t border-border pt-8">
      <h2 class="text-2xl font-semibold mb-4 text-foreground">あなたの出品商品</h2>
      <div v-if="pending">
        <p>読み込み中...</p>
      </div>
      <div v-else-if="error">
        <p>エラーが発生しました: {{ error.message }}</p>
      </div>
      <div v-else-if="products && products.length > 0">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
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
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import type { Product } from '~/types/product'
import { useFavorites } from '~/composables/useFavorites'
import { buttonVariants } from '~/components/ui/buttonVariants'
import Input from '~/components/ui/Input.vue'
import Label from '~/components/ui/Label.vue'
import Textarea from '~/components/ui/Textarea.vue'
import Button from '~/components/ui/Button.vue'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useCurrentUser()

// --- Profile State & Logic ---
const profile = ref({
  username: '',
  avatar_url: '',
  bio: '',
  website_url: '',
  x_url: '',
  youtube_url: ''
})
const profileLoading = ref(true)
const saving = ref(false)

useAsyncData('profile-data', async () => {
  if (!user.value) return
  profileLoading.value = true
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('username, avatar_url, bio, website_url, x_url, youtube_url')
      .eq('id', user.value.id)
      .single()
    if (error) throw error
    if (data) {
      profile.value = {
        username: data.username || '',
        avatar_url: data.avatar_url || '',
        bio: data.bio || '',
        website_url: data.website_url || '',
        x_url: data.x_url || '',
        youtube_url: data.youtube_url || ''
      }
    }
  } catch (e: any) {
    console.error('Error fetching profile data:', e.message)
  } finally {
    profileLoading.value = false
  }
}, {
  watch: [user]
})

async function updateProfile() {
  if (!user.value) return
  saving.value = true
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        username: profile.value.username,
        avatar_url: profile.value.avatar_url,
        bio: profile.value.bio,
        website_url: profile.value.website_url,
        x_url: profile.value.x_url,
        youtube_url: profile.value.youtube_url,
      })
      .eq('id', user.value.id)
    if (error) throw error
    alert('プロフィールを更新しました！')
  } catch (error: any) {
    alert('エラー: ' + error.message)
  } finally {
    saving.value = false
  }
}

// Fetch favorite products
const { favorites: favoriteProducts, loading: favoritesLoading, fetchFavoriteProducts } = useFavorites()

onMounted(() => {
  fetchFavoriteProducts()
})

// Fetch user's own products for sale
const { data: products, pending, error } = await useAsyncData<Product[]>(
  `user-products-${user.value?.id}`,
  async () => {
    if (!user.value) return []
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
      .eq('creator_id', user.value.id)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error fetching user products:', error)
      throw error
    }
    return data as Product[]
  },
  {
    watch: [user]
  }
)
</script>

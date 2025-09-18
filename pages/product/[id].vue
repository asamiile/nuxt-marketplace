<template>
  <div class="container mx-auto">
    <div v-if="pending" class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      <!-- Skeleton for Image -->
      <div>
        <Skeleton class="w-full aspect-square rounded-lg" />
      </div>
      <!-- Skeleton for Product Details -->
      <div class="space-y-4">
        <Skeleton class="h-10 w-3/4" />
        <Skeleton class="h-6 w-1/4" />
        <Skeleton class="h-8 w-1/3 mb-4" />
        <div class="space-y-2">
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-5/6" />
        </div>
        <div class="border-t pt-6 mt-6 space-y-4">
          <Skeleton class="h-6 w-1/2" />
          <Skeleton class="h-10 w-full" />
        </div>
        <Skeleton class="h-12 w-full mt-4" />
      </div>
    </div>
    <div v-else-if="error || !product" class="text-center">
      <h1 class="text-2xl font-bold">商品が見つかりません</h1>
      <p class="mt-4">お探しの商品は存在しないか、移動された可能性があります。</p>
      <NuxtLink to="/" :class="buttonVariants({ class: 'mt-6' })">
        ホームに戻る
      </NuxtLink>
    </div>
    <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
      <div>
        <img :src="optimizedImageUrl" :alt="product.name" class="w-full rounded-lg">
      </div>
      <div>
        <div class="mb-3">
          <span v-if="product.categories?.name" class="text-sm font-semibold bg-secondary text-foreground px-3 py-1 rounded-full">
            {{ product.categories.name }}
          </span>
        </div>

        <!-- Status Banner for Creator -->
        <div v-if="user && product.creator_id === user.id && statusDisplay"
             :class="['p-4 rounded-md mb-4 border', statusDisplay.class]">
          <p class="font-semibold">
            この商品は現在「{{ statusDisplay.text }}」ステータスです。他のユーザーには表示されません。
          </p>
          <p v-if="product.admin_notes" class="mt-2 text-sm">
            <b>管理者からのメモ:</b> {{ product.admin_notes }}
          </p>
        </div>

        <h1 class="text-3xl lg:text-4xl font-bold mb-2 text-foreground">{{ product.name }}</h1>
        <p class="text-lg text-foreground mb-4">
          作成者:
          <NuxtLink v-if="product.profiles?.username" :to="`/creator/${product.profiles.username}`" class="font-semibold hover:text-sky-500 transition-colors">
            {{ product.profiles.username }}
          </NuxtLink>
          <span v-else class="font-semibold">N/A</span>
        </p>
        <p class="text-3xl font-bold text-foreground mb-6">{{ formatPrice(product.price) }}</p>
        <p class="text-foreground mb-6 whitespace-pre-wrap">{{ product.description }}</p>

        <!-- Tags Section -->
        <div v-if="publicTags.length > 0" class="mb-8">
          <h2 class="text-lg font-semibold text-foreground mb-3">タグ</h2>
          <div class="flex flex-wrap gap-2">
            <span v-for="tag in publicTags" :key="tag.name" class="bg-secondary text-secondary-foreground px-3 py-1 text-sm rounded-full">
              #{{ tag.name }}
            </span>
          </div>
        </div>


        <!-- License and Terms Section -->
        <div v-if="product.license_type || product.terms_of_use" class="border-t pt-6 mt-6">
          <div v-if="product.license_type" class="mb-4">
            <h2 class="text-lg font-semibold text-foreground mb-2">ライセンスの種類</h2>
            <p class="text-foreground">{{ product.license_type }}</p>
          </div>
          <div v-if="product.terms_of_use">
            <h2 class="text-lg font-semibold text-foreground mb-2">利用規約</h2>
            <p class="text-foreground whitespace-pre-wrap">{{ product.terms_of_use }}</p>
          </div>
        </div>

        <div v-if="user && product.creator_id === user.id" class="flex items-center gap-4 mt-8">
          <NuxtLink :to="`/product/edit/${product.id}`" :class="buttonVariants({ variant: 'outline', class: 'w-full' })">
            編集
          </NuxtLink>
          <Button @click="handleDelete" variant="destructive" class="w-full">
            削除
          </Button>
        </div>
        <Button v-else class="w-full mt-8" size="lg">
          購入する
        </Button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProductWithRelations } from '~/types/product'
import { buttonVariants } from '~/components/ui/button'
import Button from '~/components/ui/button/Button.vue'
import Skeleton from '~/components/ui/Skeleton.vue'

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const { user } = useCurrentUser()
const { showToast } = useAlert()
const { formatPrice } = useFormatters()
const id = route.params.id

const { data: product, pending, error } = await useAsyncData<ProductWithRelations | null>(`product-${id}`, async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles (username),
      categories (name),
      tags (name, is_public)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error(`Error fetching product ${id}:`, error)
    throw error
  }

  return data
})

if (!pending.value && !product.value) {
  throw createError({ statusCode: 404, statusMessage: 'Product Not Found', fatal: true })
}

// Use the new composable
// We pass a getter function so the composable can react to changes in product.value
const { isFavoritedState, toggleFavorite } = useProductFavorite(() => product.value?.id)

const publicTags = computed(() => {
  return product.value?.tags?.filter(tag => tag.is_public) || []
})

const statusDisplay = computed(() => {
  if (!product.value) return null
  switch (product.value.status) {
    case 'pending':
      return { text: '承認待ち', class: 'bg-yellow-100 border-yellow-300 text-yellow-800' }
    case 'rejected':
      return { text: '非承認', class: 'bg-red-100 border-red-300 text-red-800' }
    default:
      return null
  }
})

useHead({
  title: product.value?.name || '商品詳細',
  meta: [
    { name: 'description', content: product.value?.description || '商品の詳細ページです。' }
  ]
})

const { getPathFromUrl, getOptimizedPublicUrl } = useSupabaseHelpers()

const optimizedImageUrl = computed(() => {
  if (!product.value?.image_url) {
    return 'https://placehold.co/800x800'
  }
  // Use the robust getPathFromUrl to check if it's a Supabase URL
  const path = getPathFromUrl(product.value.image_url)

  // If path is null, it's likely an external URL (like the seed data)
  if (!path) {
    return product.value.image_url
  }

  // Otherwise, get the optimized URL
  return getOptimizedPublicUrl(path, { width: 800, height: 800, resize: 'contain' })
})

const handleDelete = async () => {
  if (!product.value) return

  if (window.confirm(`本当に「${product.value.name}」を削除しますか？この操作は元に戻せません。`)) {
    try {
      // 1. Delete files from storage
      const imagePath = getPathFromUrl(product.value.image_url)
      const filePath = getPathFromUrl(product.value.file_url)

      if (imagePath) {
        await supabase.storage.from('assets').remove([imagePath])
      }
      if (filePath) {
        await supabase.storage.from('assets').remove([filePath])
      }

      // 2. Delete product from database
      await supabase.from('products').delete().eq('id', product.value.id)

      showToast('成功', '商品を削除しました。')
      router.push('/dashboard')

    } catch (error: any) {
      showToast('削除エラー', error.message || '商品の削除中にエラーが発生しました。', 'error')
    }
  }
}
</script>

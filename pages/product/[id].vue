<template>
  <div class="container">
    <div v-if="pending">
      <p>商品を読み込んでいます...</p>
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
        <img :src="product.image_url" :alt="product.name" class="w-full rounded-lg shadow-lg">
      </div>
      <div>
        <h1 class="text-3xl lg:text-4xl font-bold mb-2 text-foreground">{{ product.name }}</h1>
        <p class="text-lg text-foreground mb-4">
          作成者:
          <NuxtLink v-if="product.profiles?.username" :to="`/creator/${product.profiles.username}`" class="font-semibold hover:text-primary transition-colors">
            {{ product.profiles.username }}
          </NuxtLink>
          <span v-else class="font-semibold">N/A</span>
        </p>
        <p class="text-3xl font-bold text-foreground mb-6">{{ formatPrice(product.price) }}</p>
        <p class="text-foreground mb-8 whitespace-pre-wrap">{{ product.description }}</p>

        <!-- License and Terms Section -->
        <div v-if="product.license_type || product.terms_of_use" class="border-t pt-6 mt-6">
          <div v-if="product.license_type" class="mb-4">
            <h2 class="text-lg font-semibold text-foreground mb-2">ライセンスの種類</h2>
            <p class="text-foreground">{{ product.license_type }}</p>
          </div>
          <div v-if="product.terms_of_use">
            <button @click="isTermsOpen = !isTermsOpen" class="flex justify-between items-center w-full text-lg font-semibold text-foreground mb-2">
              <span>利用規約</span>
              <svg :class="{'rotate-180': isTermsOpen}" class="w-5 h-5 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div v-if="isTermsOpen" class="mt-2 p-4 bg-muted rounded-md">
              <p class="text-sm text-muted-foreground whitespace-pre-wrap">{{ product.terms_of_use }}</p>
            </div>
          </div>
        </div>

        <div v-if="user && product.creator_id === user.id" class="flex items-center gap-4 mt-8">
          <NuxtLink :to="`/product/edit/${product.id}`" :class="buttonVariants({ variant: 'outline', class: 'w-full' })">
            編集
          </NuxtLink>
          <UiButton @click="handleDelete" variant="destructive" class="w-full">
            削除
          </UiButton>
        </div>
        <UiButton v-else class="w-full mt-8" size="lg">
          購入する
        </UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'
import { buttonVariants } from '~/components/ui/buttonVariants'

const isTermsOpen = ref(false)
const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()
const user = useCurrentUser()
const { showAlert } = useAlert()
const id = route.params.id

const { data: product, pending, error } = await useAsyncData<Product | null>(`product-${id}`, async () => {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      profiles (
        username
      )
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

const formatPrice = (price: number | null) => {
  if (price === null) return ''
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
}

useHead({
  title: product.value?.name || '商品詳細',
  meta: [
    { name: 'description', content: product.value?.description || '商品の詳細ページです。' }
  ]
})

const getPathFromUrl = (url: string) => {
  try {
    const urlObject = new URL(url)
    return urlObject.pathname.split('/assets/')[1]
  } catch (error) {
    console.error('Invalid URL:', url, error)
    return null
  }
}

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

      showAlert('成功', '商品を削除しました。')
      router.push('/dashboard')

    } catch (error: any) {
      showAlert('削除エラー', error.message || '商品の削除中にエラーが発生しました。', 'error')
    }
  }
}
</script>

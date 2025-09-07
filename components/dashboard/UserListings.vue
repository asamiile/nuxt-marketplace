<template>
  <div>
    <div class="mb-4">
      <h2 class="text-2xl font-semibold text-foreground mb-3">出品した商品</h2>
      <p class="text-muted-foreground">作成した商品を管理します。</p>
    </div>
    <UiCard>
      <UiCardContent class="p-8">
        <div v-if="pending" class="text-center">
          <p>商品を読み込んでいます...</p>
        </div>
        <div v-else-if="error" class="text-center text-destructive">
          <p>商品の読み込み中にエラーが発生しました。</p>
        </div>
        <div v-else-if="products.length === 0" class="text-center text-muted-foreground">
          <p>まだ出品した商品がありません。</p>
          <NuxtLink to="/sell" :class="buttonVariants({ variant: 'default', class: 'mt-4' })">
            最初の商品を出品する
          </NuxtLink>
        </div>
        <div v-else class="space-y-4">
          <div v-for="product in products" :key="product.id" class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center gap-4">
              <img :src="product.image_url || 'https://placehold.jp/300x300.png'" :alt="product.name" class="w-16 h-16 object-cover rounded-md">
              <div>
                <h3 class="font-semibold">{{ product.name }}</h3>
                <p class="text-muted-foreground">{{ formatPrice(product.price) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <NuxtLink :to="`/product/edit/${product.id}`" :class="buttonVariants({ variant: 'outline', size: 'sm' })">
                編集
              </NuxtLink>
              <UiButton @click="confirmDelete(product)" variant="destructive" size="sm">
                削除
              </UiButton>
            </div>
          </div>
        </div>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'
import { buttonVariants } from '~/components/ui/button/buttonVariants'

const supabase = useSupabaseClient()
const user = useCurrentUser()
const { showToast } = useAlert()

const products = ref<Product[]>([])
const pending = ref(true)
const error = ref<Error | null>(null)

const fetchProducts = async () => {
  if (!user.value) return;
  pending.value = true
  error.value = null
  try {
    const { data, error: dbError } = await supabase
      .from('products')
      .select('*')
      .eq('creator_id', user.value.id)
      .order('created_at', { ascending: false })

    if (dbError) throw dbError
    products.value = data || []
  } catch (e: any) {
    error.value = e
    showToast('エラー', '商品の読み込みに失敗しました。', 'error')
  } finally {
    pending.value = false
  }
}

onMounted(fetchProducts)

const formatPrice = (price: number | null) => {
  if (price === null) return 'N/A'
  return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(price)
}

const getPathFromUrl = (url: string) => {
  try {
    const urlObject = new URL(url)
    // The path is usually after '/storage/v1/object/public/assets/'
    // For example: https://<project>.supabase.co/storage/v1/object/public/assets/user-id/file.jpg
    // The path to remove is 'user-id/file.jpg'
    return urlObject.pathname.split('/assets/')[1]
  } catch (error) {
    console.error('Invalid URL:', url, error)
    return null
  }
}

const confirmDelete = (product: Product) => {
  if (window.confirm(`本当に「${product.name}」を削除しますか？この操作は元に戻せません。`)) {
    handleDelete(product)
  }
}

const handleDelete = async (product: Product) => {
  try {
    // 1. Delete files from storage
    const imagePath = getPathFromUrl(product.image_url)
    const filePath = getPathFromUrl(product.file_url)

    if (imagePath) {
      const { error: imageError } = await supabase.storage.from('assets').remove([imagePath])
      if (imageError) console.warn(`画像ファイルの削除に失敗しました: ${imageError.message}`)
    }
    if (filePath) {
      const { error: fileError } = await supabase.storage.from('assets').remove([filePath])
      if (fileError) console.warn(`アセットファイルの削除に失敗しました: ${fileError.message}`)
    }

    // 2. Delete product from database
    const { error: dbError } = await supabase.from('products').delete().eq('id', product.id)
    if (dbError) throw new Error(`データベースからの商品削除に失敗しました: ${dbError.message}`)

    showToast('成功', '商品を削除しました。')
    // Refresh the list
    await fetchProducts()

  } catch (error: any) {
    showToast('削除エラー', error.message || '商品の削除中にエラーが発生しました。', 'error')
  }
}
</script>

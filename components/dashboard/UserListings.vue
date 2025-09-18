<template>
  <div>
    <div class="mb-4">
      <h2 class="text-2xl font-semibold text-foreground mb-3">出品した商品</h2>
      <p class="text-muted-foreground">作成した商品を管理します。</p>
    </div>
    <Card>
      <CardContent class="p-4 md:p-8">
        <Tabs v-model="activeStatusTab" class="mb-4">
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            <TabsTrigger value="approved">公開中</TabsTrigger>
            <TabsTrigger value="pending">審査中</TabsTrigger>
            <TabsTrigger value="rejected">要修正</TabsTrigger>
            <TabsTrigger value="banned">却下</TabsTrigger>
          </TabsList>
        </Tabs>

        <div v-if="pending" class="text-center py-8">
          <p>商品を読み込んでいます...</p>
        </div>
        <div v-else-if="error" class="text-center text-destructive py-8">
          <p>商品の読み込み中にエラーが発生しました。</p>
        </div>
        <div v-else-if="filteredProducts.length === 0" class="text-center text-muted-foreground py-8">
          <p v-if="activeStatusTab === 'all'">まだ出品した商品がありません。</p>
          <p v-else>このステータスの商品はありません。</p>
          <NuxtLink v-if="activeStatusTab === 'all'" to="/sell" :class="buttonVariants({ variant: 'default', class: 'mt-4' })">
            最初の商品を出品する
          </NuxtLink>
        </div>
        <div v-else class="space-y-4">
          <div v-for="product in paginatedProducts" :key="product.id" class="flex items-center justify-between p-4 border rounded-lg">
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <img :src="product.image_url || 'https://placehold.jp/300x300.png'" :alt="product.name" class="w-16 h-16 object-cover rounded-md flex-shrink-0">
              <div class="min-w-0">
                <h3 class="font-semibold truncate">{{ product.name }}</h3>
                <p class="text-muted-foreground">{{ formatPrice(product.price) }}</p>
              </div>
            </div>
            <div class="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <span :class="statusInfo(product.status).class" class="px-2 py-1 text-xs font-medium rounded-full hidden md:inline-block">
                {{ statusInfo(product.status).text }}
              </span>
              <NuxtLink v-if="product.status === 'approved' || product.status === 'rejected'" :to="`/product/edit/${product.id}`" :class="buttonVariants({ variant: 'outline', size: 'sm' })">
                編集
              </NuxtLink>
              <Button @click="confirmDelete(product)" variant="destructive" size="sm">
                削除
              </Button>
            </div>
          </div>
        </div>

        <div v-if="totalPages > 1" class="mt-6 flex justify-center">
          <Pagination
            v-model:currentPage="currentPage"
            :total-pages="totalPages"
          />
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import type { Product } from '~/types/product'
import { buttonVariants, Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import Tabs from '~/components/ui/tabs/Tabs.vue'
import TabsList from '~/components/ui/tabs/TabsList.vue'
import TabsTrigger from '~/components/ui/tabs/TabsTrigger.vue'
import Pagination from '~/components/ui/Pagination.vue'

const supabase = useSupabaseClient()
const { user } = useCurrentUser()
const { showToast } = useAlert()
const { formatPrice } = useFormatters()
const { getPathFromUrl } = useSupabaseHelpers()

const products = ref<Product[]>([])
const pending = ref(true)
const error = ref<Error | null>(null)
const activeStatusTab = ref('all')

// Pagination
const currentPage = ref(1)
const itemsPerPage = 10 // Show 10 products per page

const filteredProducts = computed(() => {
  if (activeStatusTab.value === 'all') {
    return products.value
  }
  return products.value.filter(product => product.status === activeStatusTab.value)
})

const totalPages = computed(() => {
  return Math.ceil(filteredProducts.value.length / itemsPerPage)
})

const paginatedProducts = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(startIndex, startIndex + itemsPerPage)
})

// Reset to page 1 when tab changes
watch(activeStatusTab, () => {
  currentPage.value = 1
})

const statusInfo = (status: Product['status']) => {
  switch (status) {
    case 'approved':
      return { text: '公開中', class: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
    case 'pending':
      return { text: '審査中', class: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' }
    case 'rejected':
      return { text: '要修正', class: 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200' }
    case 'banned':
      return { text: '却下', class: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200' }
    default:
      return { text: '不明', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' }
  }
}

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

const confirmDelete = (product: Product) => {
  if (window.confirm(`本当に「${product.name}」を削除しますか？この操作は元に戻せません。`)) {
    handleDelete(product)
  }
}

const handleDelete = async (product: Product) => {
  try {
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

    const { error: dbError } = await supabase.from('products').delete().eq('id', product.id)
    if (dbError) throw new Error(`データベースからの商品削除に失敗しました: ${dbError.message}`)

    showToast('成功', '商品を削除しました。')
    await fetchProducts()

  } catch (error: any) {
    showToast('削除エラー', error.message || '商品の削除中にエラーが発生しました。', 'error')
  }
}
</script>

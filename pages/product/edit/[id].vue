<template>
  <div class="container py-8">
    <div v-if="pending" class="text-center">
      <p>商品を読み込んでいます...</p>
    </div>
    <div v-else-if="!product" class="text-center">
      <h1 class="text-2xl font-bold">商品が見つからないか、編集権限がありません</h1>
      <NuxtLink to="/dashboard" :class="buttonVariants({ class: 'mt-6' })">
        ダッシュボードに戻る
      </NuxtLink>
    </div>
    <div v-else class="max-w-2xl mx-auto">
      <UiCard>
        <UiCardHeader>
          <UiCardTitle>商品を編集する</UiCardTitle>
          <UiCardDescription>フォームの内容を更新して、商品情報を変更します。</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <form @submit.prevent="handleUpdate" class="space-y-6">
            <div>
              <Label for="name">商品名</Label>
              <Input v-model="name" type="text" id="name" required class="mt-1" />
            </div>
            <div>
              <Label for="description">説明</Label>
              <Textarea v-model="description" id="description" :rows="4" required class="mt-1" />
            </div>
            <div>
              <Label for="price">価格 (円)</Label>
              <Input v-model.number="price" type="number" id="price" required min="0" class="mt-1" />
            </div>
            <div>
              <Label for="license_type">ライセンスの種類</Label>
              <Input v-model="license_type" id="license_type" class="mt-1" placeholder="例: スタンダードライセンス" />
            </div>
            <div>
              <Label for="terms_of_use">利用規約</Label>
              <Textarea v-model="terms_of_use" id="terms_of_use" :rows="3" class="mt-1" placeholder="商用利用可、改変可など" />
            </div>
            <div>
              <Label for="image">サムネイル画像 (変更する場合)</Label>
              <p class="text-sm text-muted-foreground mb-2">現在の画像: <a :href="product.image_url" target="_blank" class="underline hover:text-primary">表示</a></p>
              <Input @change="handleImageUpload" type="file" id="image" accept="image/*" class="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            </div>
            <div>
              <Label for="file">デジタルアセット (変更する場合)</Label>
               <p class="text-sm text-muted-foreground mb-2">現在のファイル: <a :href="product.file_url" target="_blank" class="underline hover:text-primary">ダウンロード</a></p>
              <Input @change="handleFileUpload" type="file" id="file" class="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
            </div>
            <div class="pt-2">
              <Button type="submit" class="w-full" size="lg" :disabled="isSubmitting">
                {{ isSubmitting ? '更新中...' : '更新する' }}
              </Button>
            </div>
          </form>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Product } from '~/types/product'
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
const route = useRoute()
const router = useRouter()
const { showAlert } = useAlert()

const id = route.params.id as string

const product = ref<Product | null>(null)
const pending = ref(true)

const name = ref('')
const description = ref('')
const price = ref<number | null>(null)
const license_type = ref('')
const terms_of_use = ref('')
const imageFile = ref<File | null>(null)
const assetFile = ref<File | null>(null)
const isSubmitting = ref(false)

// Fetch product data
onMounted(async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data || data.creator_id !== user.value?.id) {
    product.value = null
    pending.value = false
    return
  }

  product.value = data
  name.value = data.name
  description.value = data.description
  price.value = data.price
  license_type.value = data.license_type || ''
  terms_of_use.value = data.terms_of_use || ''

  pending.value = false
})

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    imageFile.value = target.files[0]
  }
}

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    assetFile.value = target.files[0]
  }
}

const getPathFromUrl = (url: string) => {
  try {
    const urlObject = new URL(url)
    return urlObject.pathname.split('/assets/')[1]
  } catch (error) {
    console.error('Invalid URL:', url, error)
    return null
  }
}

const handleUpdate = async () => {
  if (!product.value || !user.value) return

  isSubmitting.value = true

  try {
    let newImageUrl = product.value.image_url
    let newFileUrl = product.value.file_url

    // 1. Handle image file update
    if (imageFile.value) {
      const oldImagePath = getPathFromUrl(product.value.image_url)
      if (oldImagePath) {
        await supabase.storage.from('assets').remove([oldImagePath])
      }
      const imageExt = imageFile.value.name.split('.').pop()
      const imagePath = `${user.value.id}/${crypto.randomUUID()}.${imageExt}`
      const { error: imageError } = await supabase.storage.from('assets').upload(imagePath, imageFile.value)
      if (imageError) throw new Error(`画像アップロードエラー: ${imageError.message}`)
      const { data: imageUrlData } = supabase.storage.from('assets').getPublicUrl(imagePath)
      newImageUrl = imageUrlData.publicUrl
    }

    // 2. Handle asset file update
    if (assetFile.value) {
      const oldFilePath = getPathFromUrl(product.value.file_url)
      if (oldFilePath) {
        await supabase.storage.from('assets').remove([oldFilePath])
      }
      const assetExt = assetFile.value.name.split('.').pop()
      const assetPath = `${user.value.id}/${crypto.randomUUID()}.${assetExt}`
      const { error: assetError } = await supabase.storage.from('assets').upload(assetPath, assetFile.value)
      if (assetError) throw new Error(`ファイルアップロードエラー: ${assetError.message}`)
      const { data: assetUrlData } = supabase.storage.from('assets').getPublicUrl(assetPath)
      newFileUrl = assetUrlData.publicUrl
    }

    // 3. Update product record in the database
    const { error: dbError } = await supabase.from('products').update({
      name: name.value,
      description: description.value,
      price: price.value,
      image_url: newImageUrl,
      file_url: newFileUrl,
      license_type: license_type.value,
      terms_of_use: terms_of_use.value
    }).eq('id', product.value.id)

    if (dbError) throw new Error(`データベース更新エラー: ${dbError.message}`)

    // 4. Handle success
    showAlert('成功', '商品が正常に更新されました！')
    router.push(`/product/${product.value.id}`)

  } catch (error: any) {
    showAlert('更新エラー', error.message || '予期せぬエラーが発生しました。', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

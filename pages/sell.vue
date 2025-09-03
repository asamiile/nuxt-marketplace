<template>
  <div class="container mx-auto max-w-3xl py-12">
    <UiCard>
      <UiCardHeader>
        <UiCardTitle>商品を販売</UiCardTitle>
        <UiCardDescription>以下のフォームに必要事項を入力して、新しい商品を販売してください。</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div class="grid gap-2">
            <UiLabel for="name">商品名</UiLabel>
            <UiInput v-model="name" id="name" required placeholder="例: すごいデジタルアセット" />
          </div>
          <div class="grid gap-2">
            <UiLabel for="description">説明</UiLabel>
            <UiTextarea v-model="description" id="description" required placeholder="商品の特徴を詳しく説明してください。" />
          </div>
          <div class="grid gap-2">
            <UiLabel for="price">価格（円）</UiLabel>
            <UiInput v-model.number="price" type="number" id="price" required min="0" placeholder="例: 1000" />
          </div>
          <div class="grid gap-2">
            <UiLabel for="license_type">ライセンスの種類</UiLabel>
            <UiInput v-model="license_type" id="license_type" placeholder="例: Standard License" />
          </div>
          <div class="grid gap-2">
            <UiLabel for="terms_of_use">利用規約</UiLabel>
            <UiTextarea v-model="terms_of_use" id="terms_of_use" placeholder="商品の利用に関する規約や制限事項を記入してください。" />
          </div>
          <div class="grid gap-2">
            <UiLabel for="image">サムネイル画像</UiLabel>
            <UiInput @change="handleImageUpload" type="file" id="image" required accept="image/*" />
          </div>
          <div class="grid gap-2">
            <UiLabel for="file">デジタルアセット</UiLabel>
            <UiInput @change="handleFileUpload" type="file" id="file" required />
          </div>
          <UiButton type="submit" class="w-full" :disabled="isSubmitting">
            {{ isSubmitting ? 'アップロード中...' : '出品する' }}
          </UiButton>
          <p v-if="errorMessage" class="text-sm font-medium text-destructive">{{ errorMessage }}</p>
        </form>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const name = ref('')
const description = ref('')
const price = ref<number | null>(null)
const license_type = ref('')
const terms_of_use = ref('')
const imageFile = ref<File | null>(null)
const assetFile = ref<File | null>(null)
const isSubmitting = ref(false)
const errorMessage = ref('')

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

const supabase = useSupabaseClient()
const user = useCurrentUser()
const router = useRouter()

const handleSubmit = async () => {
  if (!name.value || !description.value || price.value === null || !imageFile.value || !assetFile.value || !user.value) {
    errorMessage.value = 'すべてのフィールドを入力してください。'
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    // 1. Upload files to Supabase Storage
    const imageExt = imageFile.value.name.split('.').pop()
    const imagePath = `${user.value.id}/${crypto.randomUUID()}.${imageExt}`
    const { error: imageError } = await supabase.storage.from('assets').upload(imagePath, imageFile.value)
    if (imageError) throw new Error(`画像アップロードエラー: ${imageError.message}`)

    const assetExt = assetFile.value.name.split('.').pop()
    const assetPath = `${user.value.id}/${crypto.randomUUID()}.${assetExt}`
    const { error: assetError } = await supabase.storage.from('assets').upload(assetPath, assetFile.value)
    if (assetError) throw new Error(`ファイルアップロードエラー: ${assetError.message}`)

    // 2. Get public URLs
    const { data: imageUrlData } = supabase.storage.from('assets').getPublicUrl(imagePath)
    const { data: assetUrlData } = supabase.storage.from('assets').getPublicUrl(assetPath)

    if (!imageUrlData.publicUrl || !assetUrlData.publicUrl) {
      throw new Error('ファイルURLの取得に失敗しました。')
    }

    // 3. Insert product record into the database
    const { error: dbError } = await supabase.from('products').insert({
      name: name.value,
      description: description.value,
      price: price.value,
      image_url: imageUrlData.publicUrl,
      file_url: assetUrlData.publicUrl,
      creator_id: user.value.id,
      license_type: license_type.value,
      terms_of_use: terms_of_use.value
    })

    if (dbError) throw new Error(`データベースエラー: ${dbError.message}`)

    // 4. Handle success
    alert('商品が正常にアップロードされました！')
    router.push('/dashboard')

  } catch (error: any) {
    errorMessage.value = error.message || '予期せぬエラーが発生しました。'
  } finally {
    isSubmitting.value = false
  }
}
</script>

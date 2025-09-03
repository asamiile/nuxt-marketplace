<template>
  <div>
    <h1 class="text-3xl font-bold mb-8 text-foreground">商品を出品する</h1>
    <form @submit.prevent="handleSubmit" class="max-w-2xl mx-auto bg-card p-8 rounded-lg shadow-md">
      <div class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-foreground">商品名</label>
          <input v-model="name" type="text" id="name" required class="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-background text-foreground">
        </div>
        <div>
          <label for="description" class="block text-sm font-medium text-foreground">説明</label>
          <textarea v-model="description" id="description" rows="4" required class="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-background text-foreground"></textarea>
        </div>
        <div>
          <label for="price" class="block text-sm font-medium text-foreground">価格 (円)</label>
          <input v-model.number="price" type="number" id="price" required min="0" class="mt-1 block w-full px-3 py-2 border border-border rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 bg-background text-foreground">
        </div>
        <div>
          <label for="image" class="block text-sm font-medium text-foreground">サムネイル画像</label>
          <input @change="handleImageUpload" type="file" id="image" required accept="image/*" class="mt-1 block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 dark:file:bg-pink-950 file:text-pink-600 dark:file:text-pink-300 hover:file:bg-pink-100 dark:hover:file:bg-pink-900">
        </div>
        <div>
          <label for="file" class="block text-sm font-medium text-foreground">デジタルアセット (zip, etc.)</label>
          <input @change="handleFileUpload" type="file" id="file" required class="mt-1 block w-full text-sm text-foreground file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 dark:file:bg-pink-950 file:text-pink-600 dark:file:text-pink-300 hover:file:bg-pink-100 dark:hover:file:bg-pink-900">
        </div>
      </div>
      <div class="mt-8">
        <button type="submit" class="w-full px-6 py-3 text-lg font-bold text-white rounded-md bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50" :disabled="isSubmitting">
          {{ isSubmitting ? 'アップロード中...' : '出品する' }}
        </button>
      </div>
      <p v-if="errorMessage" class="mt-4 text-sm text-red-600">{{ errorMessage }}</p>
    </form>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const name = ref('')
const description = ref('')
const price = ref<number | null>(null)
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
      creator_id: user.value.id
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

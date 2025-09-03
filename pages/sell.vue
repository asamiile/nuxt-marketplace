<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">{{ $t('sellPage.title') }}</h1>
    <form @submit.prevent="handleSubmit" class="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <div class="space-y-6">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700">{{ $t('sellPage.form.name') }}</label>
          <input v-model="name" type="text" id="name" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
          <label for="description" class="block text-sm font-medium text-gray-700">{{ $t('sellPage.form.description') }}</label>
          <textarea v-model="description" id="description" rows="4" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"></textarea>
        </div>
        <div>
          <label for="price" class="block text-sm font-medium text-gray-700">{{ $t('sellPage.form.price') }}</label>
          <input v-model.number="price" type="number" id="price" required min="0" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
        </div>
        <div>
          <label for="image" class="block text-sm font-medium text-gray-700">{{ $t('sellPage.form.image') }}</label>
          <input @change="handleImageUpload" type="file" id="image" required accept="image/*" class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100">
        </div>
        <div>
          <label for="file" class="block text-sm font-medium text-gray-700">{{ $t('sellPage.form.asset') }}</label>
          <input @change="handleFileUpload" type="file" id="file" required class="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100">
        </div>
      </div>
      <div class="mt-8">
        <button type="submit" class="w-full px-6 py-3 text-lg font-bold text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" :disabled="isSubmitting">
          {{ isSubmitting ? $t('sellPage.form.submitting') : $t('sellPage.form.submit') }}
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

const { t } = useI18n()
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
    errorMessage.value = t('sellPage.errors.allFieldsRequired')
    return
  }

  isSubmitting.value = true
  errorMessage.value = ''

  try {
    // 1. Upload files to Supabase Storage
    const imageExt = imageFile.value.name.split('.').pop()
    const imagePath = `${user.value.id}/${crypto.randomUUID()}.${imageExt}`
    const { error: imageError } = await supabase.storage.from('assets').upload(imagePath, imageFile.value)
    if (imageError) throw new Error(`${t('sellPage.errors.imageUploadError')} ${imageError.message}`)

    const assetExt = assetFile.value.name.split('.').pop()
    const assetPath = `${user.value.id}/${crypto.randomUUID()}.${assetExt}`
    const { error: assetError } = await supabase.storage.from('assets').upload(assetPath, assetFile.value)
    if (assetError) throw new Error(`${t('sellPage.errors.fileUploadError')} ${assetError.message}`)

    // 2. Get public URLs
    const { data: imageUrlData } = supabase.storage.from('assets').getPublicUrl(imagePath)
    const { data: assetUrlData } = supabase.storage.from('assets').getPublicUrl(assetPath)

    if (!imageUrlData.publicUrl || !assetUrlData.publicUrl) {
      throw new Error(t('sellPage.errors.getUrlFailed'))
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

    if (dbError) throw new Error(`${t('sellPage.errors.databaseError')} ${dbError.message}`)

    // 4. Handle success
    alert(t('sellPage.success.productUploaded'))
    router.push('/dashboard')

  } catch (error: any) {
    errorMessage.value = error.message || t('sellPage.errors.unexpectedError')
  } finally {
    isSubmitting.value = false
  }
}
</script>

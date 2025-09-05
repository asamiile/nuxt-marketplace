<template>
  <div class="container py-8">
    <div class="max-w-2xl mx-auto">
      <UiCard>
        <UiCardHeader>
          <UiCardTitle>商品を出品する</UiCardTitle>
          <UiCardDescription>以下のフォームに必要事項を入力して、新しい商品を販売してください。</UiCardDescription>
        </UiCardHeader>
        <UiCardContent>
          <form @submit.prevent="handleSubmit" class="space-y-6">
            <div>
              <Label for="name">商品名</Label>
              <Input v-model="name" type="text" id="name" class="mt-1" />
              <p v-if="errors.name" class="text-sm text-red-500 mt-1">{{ errors.name }}</p>
            </div>
            <div>
              <Label for="description">説明</Label>
              <Textarea v-model="description" id="description" :rows="4" class="mt-1" />
              <p v-if="errors.description" class="text-sm text-red-500 mt-1">{{ errors.description }}</p>
            </div>
            <div>
              <Label for="price">価格 (円)</Label>
              <Input v-model.number="price" type="number" id="price" class="mt-1" />
               <p v-if="errors.price" class="text-sm text-red-500 mt-1">{{ errors.price }}</p>
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
              <Label for="image">サムネイル画像</Label>
              <Input @change="handleImageUpload" type="file" id="image" accept="image/*" class="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              <p v-if="errors.image" class="text-sm text-red-500 mt-1">{{ errors.image }}</p>
            </div>
            <div>
              <Label for="file">デジタルアセット (zip, etc.)</Label>
              <Input @change="handleFileUpload" type="file" id="file" class="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20" />
              <p v-if="errors.file" class="text-sm text-red-500 mt-1">{{ errors.file }}</p>
            </div>
            <div class="pt-2">
              <Button type="submit" class="w-full" size="lg" :disabled="isSubmitting || isFormInvalid">
                {{ isSubmitting ? 'アップロード中...' : '出品する' }}
              </Button>
            </div>
          </form>
        </UiCardContent>
      </UiCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import Input from '~/components/ui/Input.vue'
import Label from '~/components/ui/Label.vue'
import Textarea from '~/components/ui/Textarea.vue'
import Button from '~/components/ui/Button.vue'

definePageMeta({
  middleware: 'auth'
})

// --- Form State ---
const name = ref('')
const description = ref('')
const price = ref<number | null>(null)
const license_type = ref('')
const terms_of_use = ref('')
const imageFile = ref<File | null>(null)
const assetFile = ref<File | null>(null)
const isSubmitting = ref(false)

// --- Validation ---
const errors = ref<Record<string, string>>({})

const productSchema = z.object({
  name: z.string().min(1, { message: "商品名は必須です。" }).max(50, { message: "商品名は50文字以内で入力してください。" }),
  description: z.string().min(1, { message: "説明は必須です。" }),
  price: z.number({ invalid_type_error: "価格は数値を入力してください。" }).gt(0, { message: "価格は0より大きい数値を入力してください。" }),
  image: z.instanceof(File, { message: "サムネイル画像は必須です。" }),
  file: z.instanceof(File, { message: "デジタルアセットは必須です。" })
})

const isFormInvalid = computed(() => {
  const result = productSchema.safeParse({
    name: name.value,
    description: description.value,
    price: price.value,
    image: imageFile.value,
    file: assetFile.value
  })
  return !result.success
})

const validate = () => {
  const result = productSchema.safeParse({
    name: name.value,
    description: description.value,
    price: price.value,
    image: imageFile.value,
    file: assetFile.value
  })

  if (!result.success) {
    const newErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      newErrors[issue.path[0]] = issue.message
    }
    errors.value = newErrors
    return false
  }
  errors.value = {}
  return true
}

// Watch for changes to validate fields individually
watch(name, () => { if (errors.value.name) validate() })
watch(description, () => { if (errors.value.description) validate() })
watch(price, () => { if (errors.value.price) validate() })
watch(imageFile, () => { if (errors.value.image) validate() })
watch(assetFile, () => { if (errors.value.file) validate() })


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
const { showAlert } = useAlert()

const handleSubmit = async () => {
  if (!validate() || !user.value || !imageFile.value || !assetFile.value) {
    return
  }

  isSubmitting.value = true

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
    const { data, error: dbError } = await supabase.from('products').insert({
      name: name.value,
      description: description.value,
      price: price.value,
      image_url: imageUrlData.publicUrl,
      file_url: assetUrlData.publicUrl,
      creator_id: user.value.id,
      license_type: license_type.value,
      terms_of_use: terms_of_use.value
    }).select().single()

    if (dbError) throw new Error(`データベースエラー: ${dbError.message}`)

    // 4. Handle success
    showAlert('成功', '商品が正常にアップロードされました！')
    router.push(`/product/${data.id}`)

  } catch (error: any) {
    showAlert('エラー', error.message || '予期せぬエラーが発生しました。', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>
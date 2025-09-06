<template>
  <div>
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
      <h1 class="text-3xl font-bold text-center mb-4 text-foreground">
        商品を編集する
      </h1>
      <p class="text-center mb-8">フォームの内容を更新して、商品情報を変更します。</p>
      <div class="text-card-foreground rounded shadow-md dark:shadow-sky-500/20 border-0 p-8 pt-8">
          <form @submit.prevent="handleUpdate" class="space-y-6">
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
              <Label for="category">カテゴリ</Label>
              <select v-model="categoryId" id="category" class="flex h-10 w-full items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-muted-foreground">
                <option :value="null" disabled>カテゴリを選択してください</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </select>
              <p v-if="errors.categoryId" class="text-sm text-red-500 mt-1">{{ errors.categoryId }}</p>
            </div>
            <div>
              <Label for="tags">タグ (カンマ区切りまたはEnterで追加)</Label>
              <Input v-model="tagInput" @keydown.enter.prevent="addTag" @keydown.,.prevent="addTag" type="text" id="tags" class="mt-1" placeholder="例: イラスト, 3Dモデル" />
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-for="tag in tags" :key="tag" class="inline-flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm font-medium rounded-full">
                  {{ tag }}
                  <button @click="removeTag(tag)" type="button" class="ml-1.5 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span class="sr-only">Remove tag</span>
                    <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8"><path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" /></svg>
                  </button>
                </span>
              </div>
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
              <FileDropzone v-model="imageFile" accept="image/*" :initial-preview-url="product.image_url" class="mt-1" />
            </div>
            <div>
              <Label for="file">デジタルアセット (変更する場合)</Label>
              <FileDropzone v-model="assetFile" class="mt-1" />
              <p class="text-sm text-muted-foreground mt-2">現在のファイル: <a :href="product.file_url" target="_blank" class="underline hover:text-sky-500">ダウンロード</a></p>
            </div>
            <div class="pt-2">
              <Button type="submit" class="w-full" size="lg" :disabled="isSubmitting || (hasAttemptedSubmit && isFormInvalid)">
                {{ isSubmitting ? '更新中...' : '更新する' }}
              </Button>
            </div>
          </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { z } from 'zod'
import type { ProductWithRelations } from '~/types/product'
import { buttonVariants } from '~/components/ui/button/buttonVariants'
import Input from '~/components/ui/form/Input.vue'
import Label from '~/components/ui/form/Label.vue'
import Textarea from '~/components/ui/form/Textarea.vue'
import Button from '~/components/ui/button/Button.vue'
import FileDropzone from '~/components/ui/form/FileDropzone.vue'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useCurrentUser()
const route = useRoute()
const router = useRouter()
const { showToast } = useAlert()
const { getPathFromUrl } = useSupabaseHelpers()

const id = route.params.id as string

// --- Page State ---
const product = ref<ProductWithRelations | null>(null)
const pending = ref(true)
const isSubmitting = ref(false)
const hasAttemptedSubmit = ref(false)

// --- Form State ---
const name = ref('')
const description = ref('')
const price = ref<number | null>(null)
const categoryId = ref<number | null>(null)
const tags = ref<string[]>([])
const tagInput = ref('')
const license_type = ref('')
const terms_of_use = ref('')
const imageFile = ref<File | null>(null)
const assetFile = ref<File | null>(null)

// --- Data ---
const categories = ref<{id: number; name: string}[]>([])

// --- Validation ---
const errors = ref<Record<string, string>>({})

const productSchema = z.object({
  name: z.string().min(1, { message: "商品名は必須です。" }).max(50, { message: "商品名は50文字以内で入力してください。" }),
  description: z.string().min(1, { message: "説明は必須です。" }),
  price: z.coerce.number({ invalid_type_error: "価格は数値を入力してください。" }).gt(0, { message: "価格は0より大きい数値を入力してください。" }),
  categoryId: z.coerce.number().min(1, { message: "カテゴリは必須です。" }),
  image: z.instanceof(File).optional().nullable(),
  file: z.instanceof(File).optional().nullable()
})

const isFormInvalid = computed(() => {
  const result = productSchema.safeParse({
    name: name.value,
    description: description.value,
    price: price.value,
    categoryId: categoryId.value,
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
    categoryId: categoryId.value,
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
watch(name, () => { if (hasAttemptedSubmit.value) validate() })
watch(description, () => { if (hasAttemptedSubmit.value) validate() })
watch(price, () => { if (hasAttemptedSubmit.value) validate() })
watch(categoryId, () => { if (hasAttemptedSubmit.value) validate() })
watch(imageFile, () => { if (hasAttemptedSubmit.value) validate() })
watch(assetFile, () => { if (hasAttemptedSubmit.value) validate() })

// --- Category & Tag Logic ---
const fetchCategories = async () => {
  const { data, error } = await supabase.from('categories').select('id, name').order('name')
  if (error) {
    showToast('エラー', 'カテゴリの読み込みに失敗しました。', 'error')
  } else {
    categories.value = data
  }
}

const addTag = () => {
  const newTag = tagInput.value.trim()
  if (newTag && !tags.value.includes(newTag)) {
    tags.value.push(newTag)
  }
  tagInput.value = ''
}

const removeTag = (tagToRemove: string) => {
  tags.value = tags.value.filter(tag => tag !== tagToRemove)
}

// Fetch initial data
onMounted(async () => {
  // Fetch both product and categories in parallel
  const [productResult, categoriesResult] = await Promise.all([
    supabase.from('products').select('*, tags(name)').eq('id', id).single(),
    supabase.from('categories').select('id, name').order('name')
  ])

  // Handle categories loading
  if (categoriesResult.error) {
    showToast('エラー', 'カテゴリの読み込みに失敗しました。', 'error')
  } else {
    categories.value = categoriesResult.data
  }

  // Handle product loading
  const { data, error } = productResult
  if (error || !data || data.creator_id !== user.value?.id) {
    product.value = null
    pending.value = false
    return
  }

  product.value = data as ProductWithRelations
  name.value = data.name
  description.value = data.description
  price.value = data.price
  categoryId.value = data.category_id
  tags.value = data.tags.map((t: any) => t.name)
  license_type.value = data.license_type || ''
  terms_of_use.value = data.terms_of_use || ''

  pending.value = false
})

const handleUpdate = async () => {
  hasAttemptedSubmit.value = true
  if (!validate() || !product.value || !user.value) {
    return
  }

  isSubmitting.value = true

  try {
    // 1. Upsert tags and get their IDs
    let tagIds: number[] = []
    if (tags.value.length > 0) {
      const tagsToUpsert = tags.value.map(name => ({ name }))
      const { data: upsertedTags, error: tagError } = await supabase
        .from('tags')
        .upsert(tagsToUpsert, { onConflict: 'name', ignoreDuplicates: false })
        .select('id')

      if (tagError) throw new Error(`タグの保存エラー: ${tagError.message}`)
      if (upsertedTags) {
        tagIds = upsertedTags.map(tag => tag.id)
      }
    }

    let newImageUrl = product.value.image_url
    let newFileUrl = product.value.file_url

    // 2. Handle file updates (image and asset)
    if (imageFile.value) {
      const oldImagePath = getPathFromUrl(product.value.image_url)
      if (oldImagePath) await supabase.storage.from('assets').remove([oldImagePath])

      const imageExt = imageFile.value.name.split('.').pop()
      const imagePath = `products/${user.value.id}/${crypto.randomUUID()}.${imageExt}`
      const { error: imageError } = await supabase.storage.from('assets').upload(imagePath, imageFile.value)
      if (imageError) throw new Error(`画像アップロードエラー: ${imageError.message}`)
      const { data: imageUrlData } = supabase.storage.from('assets').getPublicUrl(imagePath)
      newImageUrl = imageUrlData.publicUrl
    }

    if (assetFile.value) {
      const oldFilePath = getPathFromUrl(product.value.file_url)
      if (oldFilePath) await supabase.storage.from('assets').remove([oldFilePath])

      const assetExt = assetFile.value.name.split('.').pop()
      const assetPath = `products/${user.value.id}/${crypto.randomUUID()}.${assetExt}`
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
      category_id: categoryId.value,
      image_url: newImageUrl,
      file_url: newFileUrl,
      license_type: license_type.value,
      terms_of_use: terms_of_use.value
    }).eq('id', product.value.id)

    if (dbError) throw new Error(`データベース更新エラー: ${dbError.message}`)

    // 4. Clear old tag relations
    const { error: deleteError } = await supabase.from('product_tags').delete().eq('product_id', product.value.id)
    if (deleteError) throw new Error(`既存タグの削除エラー: ${deleteError.message}`)

    // 5. Insert new tag relations
    if (tagIds.length > 0) {
      const productTags = tagIds.map(tag_id => ({
        product_id: product.value!.id,
        tag_id: tag_id,
      }))
      const { error: productTagError } = await supabase.from('product_tags').insert(productTags)
      if (productTagError) throw new Error(`商品とタグの関連付けエラー: ${productTagError.message}`)
    }

    // 6. Handle success
    showToast('成功', '商品が正常に更新されました！')
    router.push(`/product/${product.value.id}`)
    hasAttemptedSubmit.value = false

  } catch (error: any) {
    showToast('更新エラー', error.message || '予期せぬエラーが発生しました。', 'error')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
select {
    padding-right: 2.5rem;
    background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
    background-position: right 0.5rem center;
    background-repeat: no-repeat;
    background-size: 1.5em 1.5em;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
}
</style>
import { ref, computed, watch, onMounted, type Ref } from 'vue'
import { z } from 'zod'
import type { ProductWithRelations } from '~/types/product'
import type { Tag } from '~/types/product'

type Mode = 'create' | 'edit'
interface UseProductFormOptions {
  isAdmin?: boolean
}

export function useProductForm(
  mode: Mode,
  productToEdit?: Ref<ProductWithRelations | null>,
  options: UseProductFormOptions = {},
) {
  const { isAdmin = false } = options
  const supabase = useSupabaseClient()
  const user = useCurrentUser()
  const router = useRouter()
  const { showToast } = useAlert()
  const { getPathFromUrl } = useSupabaseHelpers()

  // --- Form State ---
  const name = ref('')
  const description = ref('')
  const price = ref<number | null>(null)
  const categoryId = ref<number | null>(null)
  const tags = ref<Tag[]>([])
  const license_type = ref('')
  const terms_of_use = ref('')
  const imageFile = ref<File | null>(null)
  const assetFile = ref<File | null>(null)
  const isSubmitting = ref(false)
  const hasAttemptedSubmit = ref(false)

  // --- Data ---
  const categories = ref<{id: number; name: string}[]>([])
  const publicTags = ref<Tag[]>([])

  // --- Validation ---
  const errors = ref<Record<string, string>>({})

  const commonSchema = {
    name: z.string().min(1, { message: "商品名は必須です。" }).max(50, { message: "商品名は50文字以内で入力してください。" }),
    description: z.string().min(1, { message: "説明は必須です。" }),
    price: z.coerce.number({ invalid_type_error: "価格は数値を入力してください。" }).gt(0, { message: "価格は0より大きい数値を入力してください。" }),
    categoryId: z.coerce.number().min(1, { message: "カテゴリは必須です。" }),
  }

  const createSchema = z.object({
    ...commonSchema,
    image: z.instanceof(File, { message: "サムネイル画像は必須です。" }),
    file: z.instanceof(File, { message: "デジタルアセットは必須です。" })
  })

  const editSchema = z.object({
    ...commonSchema,
    image: z.instanceof(File).optional().nullable(),
    file: z.instanceof(File).optional().nullable()
  })

  const productSchema = mode === 'create' ? createSchema : editSchema

  const isFormInvalid = computed(() => {
    return !productSchema.safeParse({
      name: name.value,
      description: description.value,
      price: price.value,
      categoryId: categoryId.value,
      image: imageFile.value,
      file: assetFile.value
    }).success
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

  // --- Data Fetching and Tag Logic ---
  const fetchCategories = async () => {
    const { data, error } = await supabase.from('categories').select('id, name').order('name')
    if (error) {
      showToast('エラー', 'カテゴリの読み込みに失敗しました。', 'error')
    } else {
      categories.value = data
    }
  }

  const fetchPublicTags = async () => {
    const { data, error } = await supabase.from('tags').select('id, name').eq('is_public', true).order('name')
    if (error) {
      showToast('エラー', 'タグの読み込みに失敗しました。', 'error')
    } else {
      publicTags.value = data
    }
  }

  const addTag = (tag: Tag) => {
    if (!tags.value.some(t => t.id === tag.id)) {
      tags.value.push(tag)
    }
  }

  const removeTag = (tagToRemove: Tag) => {
    tags.value = tags.value.filter(tag => tag.id !== tagToRemove.id)
  }

  // --- Initialization ---
  onMounted(() => {
    fetchCategories()
    fetchPublicTags()
  })

  // Watch for the product to be loaded in edit mode
  if (mode === 'edit' && productToEdit) {
    watch(productToEdit, (newProduct) => {
      if (newProduct) {
        name.value = newProduct.name
        description.value = newProduct.description
        price.value = newProduct.price
        categoryId.value = newProduct.category_id
        // The fetched product includes tags with {id, name}.
        // Ensure the tags are correctly cast to the `Tag` type.
        tags.value = newProduct.tags as Tag[]
        license_type.value = newProduct.license_type || ''
        terms_of_use.value = newProduct.terms_of_use || ''
      }
    }, { immediate: true }) // Use immediate to run on initial load if productToEdit already has a value
  }


  // --- Submission ---
  const submit = async () => {
    hasAttemptedSubmit.value = true
    if (!validate() || !user.value) {
      return
    }
    if (mode === 'create' && (!imageFile.value || !assetFile.value)) {
        return
    }

    isSubmitting.value = true

    try {
      // 1. Get IDs from selected tags
      const tagIds = tags.value.map(tag => tag.id)

      // 2. Handle file uploads
      const productBeingEdited = productToEdit?.value
      let newImageUrl = mode === 'edit' && productBeingEdited ? productBeingEdited.image_url : ''
      if (imageFile.value) {
        if (mode === 'edit' && productBeingEdited?.image_url) {
            const oldImagePath = getPathFromUrl(productBeingEdited.image_url)
            if (oldImagePath) await supabase.storage.from('assets').remove([oldImagePath])
        }
        const imageExt = imageFile.value.name.split('.').pop()
        const imagePath = `products/${user.value.id}/${crypto.randomUUID()}.${imageExt}`
        const { error: imageError } = await supabase.storage.from('assets').upload(imagePath, imageFile.value)
        if (imageError) throw new Error(`画像アップロードエラー: ${imageError.message}`)
        const { data: imageUrlData } = supabase.storage.from('assets').getPublicUrl(imagePath)
        newImageUrl = imageUrlData.publicUrl
      }

      let newFileUrl = mode === 'edit' && productBeingEdited ? productBeingEdited.file_url : ''
      if (assetFile.value) {
        if (mode === 'edit' && productBeingEdited?.file_url) {
            const oldFilePath = getPathFromUrl(productBeingEdited.file_url)
            if (oldFilePath) await supabase.storage.from('assets').remove([oldFilePath])
        }
        const assetExt = assetFile.value.name.split('.').pop()
        const assetPath = `products/${user.value.id}/${crypto.randomUUID()}.${assetExt}`
        const { error: assetError } = await supabase.storage.from('assets').upload(assetPath, assetFile.value)
        if (assetError) throw new Error(`ファイルアップロードエラー: ${assetError.message}`)
        const { data: assetUrlData } = supabase.storage.from('assets').getPublicUrl(assetPath)
        newFileUrl = assetUrlData.publicUrl
      }

      if (!newImageUrl || !newFileUrl) {
        throw new Error('ファイルURLの取得に失敗しました。');
      }

      // 3. Prepare product data
      const productData: any = {
        name: name.value,
        description: description.value,
        price: price.value,
        category_id: categoryId.value,
        image_url: newImageUrl,
        file_url: newFileUrl,
        license_type: license_type.value,
        terms_of_use: terms_of_use.value,
        creator_id: user.value.id,
      }

      if (mode === 'create') {
        productData.status = isAdmin ? 'approved' : 'pending'
      }

      let productId = mode === 'edit' && productBeingEdited ? productBeingEdited.id : null

      // 4. Insert or Update product record
      if (mode === 'create') {
        const { data: newProduct, error: dbError } = await supabase.from('products').insert(productData).select().single()
        if (dbError) throw new Error(`データベースエラー: ${dbError.message}`)
        if (!newProduct) throw new Error('商品IDの取得に失敗しました。')
        productId = newProduct.id
      } else {
        const { error: dbError } = await supabase.from('products').update(productData).eq('id', productId)
        if (dbError) throw new Error(`データベース更新エラー: ${dbError.message}`)
      }

      if (!productId) {
        throw new Error('商品IDが不明です。')
      }

      // 5. Link tags to the product
      if (mode === 'edit' && productId) {
        const { error: deleteError } = await supabase.from('product_tags').delete().eq('product_id', productId)
        if (deleteError) throw new Error(`既存タグの削除エラー: ${deleteError.message}`)
      }
      if (tagIds.length > 0 && productId) {
        const productTags = tagIds.map(tag_id => ({
          product_id: productId,
          tag_id: tag_id,
        }))
        const { error: productTagError } = await supabase.from('product_tags').insert(productTags)
        if (productTagError) throw new Error(`商品とタグの関連付けエラー: ${productTagError.message}`)
      }

      // 6. Handle success
      if (isAdmin) {
        showToast('成功', mode === 'create' ? '商品が正常に登録されました！' : '商品が正常に更新されました！')
        router.push('/admin/products')
      }
      else if (mode === 'create') {
        showToast('成功', '商品の出品申請が完了しました。管理者による承認をお待ちください。')
        router.push('/dashboard')
      }
      else {
        showToast('成功', '商品が正常に更新されました！')
        router.push(`/product/${productId}`)
      }
      hasAttemptedSubmit.value = false

    } catch (error: any) {
      showToast('エラー', error.message || '予期せぬエラーが発生しました。', 'error')
    } finally {
      isSubmitting.value = false
    }
  }

  return {
    name,
    description,
    price,
    categoryId,
    tags,
    license_type,
    terms_of_use,
    imageFile,
    assetFile,
    isSubmitting,
    hasAttemptedSubmit,
    categories,
    publicTags,
    errors,
    isFormInvalid,
    addTag,
    removeTag,
    submit
  }
}

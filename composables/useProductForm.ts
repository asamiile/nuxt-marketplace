import { ref, computed, watch, onMounted, type Ref } from 'vue'
import { z } from 'zod'
import type { ProductWithRelations } from '~/types/product'
import type { Tag } from '~/types/product'

type Mode = 'create' | 'edit'

export function useProductForm(
  mode: Mode,
  productToEdit?: Ref<ProductWithRelations | null>,
) {
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

    // For 'edit' mode, we need to ensure the product to edit is loaded.
    const productBeingEdited = productToEdit?.value
    if (mode === 'edit' && !productBeingEdited) {
      showToast('エラー', '編集対象の商品が読み込まれていません。', 'error');
      return;
    }

    if (mode === 'create' && (!imageFile.value || !assetFile.value)) {
        return
    }

    isSubmitting.value = true

    try {
      // --- File Uploads (Common for Create and Edit) ---
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


      // --- Database Operations ---
      if (mode === 'create') {
        // Use RPC for creation
        const { data: newProductId, error: rpcError } = await supabase.rpc('create_product', {
            p_name: name.value,
            p_description: description.value,
            p_price: price.value,
            p_category_id: categoryId.value,
            p_image_url: newImageUrl,
            p_file_url: newFileUrl,
            p_license_type: license_type.value,
            p_terms_of_use: terms_of_use.value,
            p_tag_names: tags.value.map(t => t.name)
        })

        if (rpcError) throw rpcError;

        // Handle success for creation
        showToast('成功', '商品の出品申請が完了しました。管理者による承認をお待ちください。', 'success');
        router.push('/dashboard');

      } else {
        // Use RPC for update
        const { error: rpcError } = await supabase.rpc('update_product', {
            p_product_id: productBeingEdited!.id,
            p_name: name.value,
            p_description: description.value,
            p_price: price.value,
            p_category_id: categoryId.value,
            p_image_url: newImageUrl,
            p_file_url: newFileUrl,
            p_license_type: license_type.value,
            p_terms_of_use: terms_of_use.value,
            p_tag_ids: tags.value.map(t => t.id)
        })

        if (rpcError) throw rpcError;

        // Handle success for edit
        showToast('成功', '商品の変更を申請しました。管理者による承認をお待ちください。', 'success');
        // Redirect to the dashboard's listings tab.
        router.push('/dashboard?tab=listings');
      }

      hasAttemptedSubmit.value = false

    } catch (error: any) {
      showToast('エラー', error.message || '予期せぬエラーが発生しました。', 'error');
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

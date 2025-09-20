import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProductForm } from '~/composables/useProductForm'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

// --- Mocks ---
const { useSupabaseClientMock, useCurrentUserMock, useRouterMock, useAlertMock, useSupabaseHelpersMock } = vi.hoisted(() => ({
  useSupabaseClientMock: vi.fn(),
  useCurrentUserMock: vi.fn(),
  useRouterMock: vi.fn(),
  useAlertMock: vi.fn(),
  useSupabaseHelpersMock: vi.fn(),
}))

mockNuxtImport('useSupabaseClient', () => useSupabaseClientMock)
mockNuxtImport('useCurrentUser', () => useCurrentUserMock)
mockNuxtImport('useRouter', () => useRouterMock)
mockNuxtImport('useAlert', () => useAlertMock)
mockNuxtImport('useSupabaseHelpers', () => useSupabaseHelpersMock)

// --- Tests ---
describe('useProductForm', () => {
  let supabase: any
  let router: any
  let alert: any
  let helpers: any
  let storageFrom: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Create a persistent mock for the storage methods
    storageFrom = {
      upload: vi.fn().mockResolvedValue({ error: null }),
      remove: vi.fn().mockResolvedValue({ error: null }),
      getPublicUrl: vi.fn((path: string) => ({ data: { publicUrl: `https://test.com/${path}` } })),
    }

    supabase = {
      from: vi.fn(() => supabase),
      select: vi.fn(() => supabase),
      insert: vi.fn(() => supabase),
      update: vi.fn(() => supabase),
      delete: vi.fn(() => supabase),
      eq: vi.fn(() => supabase),
      order: vi.fn(() => supabase),
      single: vi.fn().mockResolvedValue({ data: {}, error: null }),
      rpc: vi.fn().mockResolvedValue({ data: { id: 123 }, error: null }),
      storage: {
        from: vi.fn(() => storageFrom),
      },
    }
    router = { push: vi.fn() }
    alert = { showToast: vi.fn() }
    helpers = { getPathFromUrl: vi.fn((url: string) => url.split('/').pop()) }

    useSupabaseClientMock.mockReturnValue(supabase)
    useRouterMock.mockReturnValue(router)
    useAlertMock.mockReturnValue(alert)
    useSupabaseHelpersMock.mockReturnValue(helpers)
    useCurrentUserMock.mockReturnValue({
      user: ref({ id: 'user-123' }),
      isAdmin: ref(false),
    })
  })

  describe('Validation (Create Mode)', () => {
    it('should fail if required fields are missing', async () => {
      const { submit, errors } = useProductForm('create')
      await submit()
      expect(errors.value.name).toBe('商品名は必須です。')
      expect(errors.value.price).toBe('価格は0より大きい数値を入力してください。')
      expect(errors.value.categoryId).toBe('カテゴリは必須です。')
      expect(errors.value.image).toBe('サムネイル画像は必須です。')
      expect(errors.value.file).toBe('デジタルアセットは必須です。')
      expect(supabase.rpc).not.toHaveBeenCalled()
    })

    it('should pass if all required fields are provided', async () => {
      const { submit, errors, name, description, price, categoryId, imageFile, assetFile } = useProductForm('create')
      name.value = 'Test'
      description.value = 'Test desc'
      price.value = 100
      categoryId.value = 1
      imageFile.value = new File([''], 'test.png')
      assetFile.value = new File([''], 'test.zip')

      await submit()

      // We expect errors to be empty now
      expect(errors.value).toEqual({})
      // And the submission process to have started
      expect(supabase.rpc).toHaveBeenCalled()
    })
  })

  describe('Submission (Create Mode)', () => {
    it('should call rpc with correct payload on successful submission', async () => {
      vi.spyOn(crypto, 'randomUUID').mockReturnValue('fixed-uuid-for-testing')
      const { name, description, price, categoryId, imageFile, assetFile, submit } = useProductForm('create')

      // Populate form
      name.value = 'Test Product'
      description.value = 'Test Description'
      price.value = 1000
      categoryId.value = 1
      imageFile.value = new File(['image'], 'image.png', { type: 'image/png' })
      assetFile.value = new File(['asset'], 'asset.zip', { type: 'application/zip' })

      await submit()

      expect(supabase.storage.from).toHaveBeenCalledWith('assets')
      expect(storageFrom.upload).toHaveBeenCalledTimes(2)
      expect(supabase.rpc).toHaveBeenCalledTimes(1)
      const expectedImagePath = 'products/user-123/fixed-uuid-for-testing.png'
      const expectedAssetPath = 'products/user-123/fixed-uuid-for-testing.zip'

      expect(supabase.rpc).toHaveBeenCalledWith('create_product', {
        p_name: 'Test Product',
        p_description: 'Test Description',
        p_price: 1000,
        p_category_id: 1,
        p_image_url: `https://test.com/${expectedImagePath}`,
        p_file_url: `https://test.com/${expectedAssetPath}`,
        p_license_type: '',
        p_terms_of_use: '',
        p_tag_names: [],
      })
      expect(alert.showToast).toHaveBeenCalledWith({
        title: '成功',
        description: '商品の出品申請が完了しました。管理者による承認をお待ちください。',
      })
      expect(router.push).toHaveBeenCalledWith('/dashboard')
    })

     it('should show an error toast if rpc call fails', async () => {
      const { name, description, price, categoryId, imageFile, assetFile, submit } = useProductForm('create')
      name.value = 'Test Product'
      description.value = 'Test Description'
      price.value = 1000
      categoryId.value = 1
      imageFile.value = new File(['image'], 'image.png', { type: 'image/png' })
      assetFile.value = new File(['asset'], 'asset.zip', { type: 'application/zip' })

      const rpcError = new Error('Database RPC Error')
      supabase.rpc.mockResolvedValue({ error: rpcError })

      await submit()

      expect(supabase.rpc).toHaveBeenCalled()
      expect(router.push).not.toHaveBeenCalled()
      expect(alert.showToast).toHaveBeenCalledWith({
        title: 'エラー',
        description: rpcError.message,
        variant: 'error',
      })
    })
  })
})

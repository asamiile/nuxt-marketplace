import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useContactForm } from '~/composables/useContactForm'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { nextTick } from 'vue'

// --- Mocks ---
const { useSupabaseClientMock } = vi.hoisted(() => ({
  useSupabaseClientMock: vi.fn(),
}))

const { useAlertMock } = vi.hoisted(() => ({
  useAlertMock: vi.fn(),
}))

mockNuxtImport('useSupabaseClient', () => useSupabaseClientMock)
mockNuxtImport('useAlert', () => useAlertMock)

// --- Tests ---
describe('useContactForm', () => {
  let supabaseClientMock: any
  let alertMock: any

  beforeEach(() => {
    vi.clearAllMocks()
    // Re-assign mocks before each test to get fresh instances
    supabaseClientMock = { functions: { invoke: vi.fn() } }
    alertMock = { showToast: vi.fn() }
    useSupabaseClientMock.mockReturnValue(supabaseClientMock)
    useAlertMock.mockReturnValue(alertMock)
  })

  describe('Validation', () => {
    it('should show errors and not submit if form is empty', async () => {
      const { handleSubmit, errors } = useContactForm()

      await handleSubmit()

      expect(supabaseClientMock.functions.invoke).not.toHaveBeenCalled()
      expect(errors.value.name).toBe('お名前は必須です。')
      expect(errors.value.email).toBe('有効なメールアドレスを入力してください。')
      expect(errors.value.subject).toBe('件名は必須です。')
      expect(errors.value.message).toBe('お問い合わせ内容は必須です。')
    })

    it('should clear errors for a field when it becomes valid', async () => {
      const { form, errors, hasAttemptedSubmit, handleSubmit } = useContactForm()
      hasAttemptedSubmit.value = true // Trigger validation on change

      // Simulate initial error state
      await handleSubmit()
      expect(errors.value.name).toBe('お名前は必須です。')

      // Fix the error
      form.value.name = 'Test User'
      await nextTick() // Allow watcher to run

      // Now the specific error should be gone
      expect(errors.value.name).toBeUndefined()
    })

    it('isFormInvalid should be true for invalid data and false for valid data', () => {
      const { form, isFormInvalid } = useContactForm()
      expect(isFormInvalid.value).toBe(true) // Initially invalid

      form.value = {
        name: 'John Doe',
        email: 'john.doe@example.com',
        subject: 'Test',
        message: 'This is a test message.',
      }

      expect(isFormInvalid.value).toBe(false) // Should be valid now
    })
  })

  describe('Submission', () => {
    it('should call supabase.functions.invoke with correct data on successful submission', async () => {
      const { form, handleSubmit } = useContactForm()
      const formData = {
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        subject: 'Inquiry',
        message: 'Hello there!',
      }
      form.value = formData

      // Mock successful invocation
      supabaseClientMock.functions.invoke.mockResolvedValue({ error: null })

      await handleSubmit()

      expect(supabaseClientMock.functions.invoke).toHaveBeenCalledTimes(1)
      expect(supabaseClientMock.functions.invoke).toHaveBeenCalledWith('contact', {
        body: formData,
      })
    })

    it('should reset the form and show a success toast on successful submission', async () => {
      const { form, handleSubmit, errors, hasAttemptedSubmit } = useContactForm()
      form.value = { name: 'Test', email: 'test@test.com', subject: 'Test', message: 'Test' }
      errors.value = { name: 'some error' } // Set a pre-existing error
      hasAttemptedSubmit.value = true

      supabaseClientMock.functions.invoke.mockResolvedValue({ error: null })

      await handleSubmit()

      expect(form.value.name).toBe('')
      expect(form.value.email).toBe('')
      expect(errors.value).toEqual({})
      expect(hasAttemptedSubmit.value).toBe(false)
      expect(alertMock.showToast).toHaveBeenCalledWith('成功', 'お問い合わせいただきありがとうございます。メッセージは正常に送信されました。', 'success')
    })

    it('should show an error toast if submission fails', async () => {
      const { form, handleSubmit } = useContactForm()
      form.value = { name: 'Test', email: 'test@test.com', subject: 'Test', message: 'Test' }
      const submissionError = new Error('Network Failure')
      supabaseClientMock.functions.invoke.mockResolvedValue({ error: submissionError })

      await handleSubmit()

      expect(alertMock.showToast).toHaveBeenCalledWith({
        title: 'エラー',
        description: `エラーが発生しました: ${submissionError.message}`,
        variant: 'error',
      })
    })
  })
})

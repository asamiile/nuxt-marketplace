import { ref, computed, watch } from 'vue'
import { z } from 'zod'

export function useContactForm() {
  const { showToast } = useAlert()
  const supabase = useSupabaseClient()

  // --- Form State ---
  const form = ref({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const loading = ref(false)
  const hasAttemptedSubmit = ref(false)

  // --- Validation ---
  const errors = ref<Record<string, string>>({})

  const contactSchema = z.object({
    name: z.string().min(1, { message: "お名前は必須です。" }),
    email: z.string().email({ message: "有効なメールアドレスを入力してください。" }),
    subject: z.string().min(1, { message: "件名は必須です。" }),
    message: z.string().min(1, { message: "お問い合わせ内容は必須です。" }),
  })

  const isFormInvalid = computed(() => {
    return !contactSchema.safeParse(form.value).success
  })

  const validate = () => {
    const result = contactSchema.safeParse(form.value)
    if (!result.success) {
      const newErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        newErrors[issue.path[0]] = issue.message
      })
      errors.value = newErrors
      return false
    }
    errors.value = {}
    return true
  }

  // Watch for changes to validate fields individually
  watch(() => form.value.name, () => { if (hasAttemptedSubmit.value) validate() })
  watch(() => form.value.email, () => { if (hasAttemptedSubmit.value) validate() })
  watch(() => form.value.subject, () => { if (hasAttemptedSubmit.value) validate() })
  watch(() => form.value.message, () => { if (hasAttemptedSubmit.value) validate() })

  // --- Submission ---
  async function handleSubmit() {
    hasAttemptedSubmit.value = true
    if (!validate()) {
      return
    }

    loading.value = true
    try {
      const { error } = await supabase.functions.invoke('contact', {
        body: form.value,
      })

      if (error) {
        throw new Error(error.message)
      }

      showToast('成功', 'お問い合わせいただきありがとうございます。メッセージは正常に送信されました。', 'success')
      // フォームをリセット
      form.value = {
        name: '',
        email: '',
        subject: '',
        message: '',
      }
      // エラーもリセット
      errors.value = {}
      hasAttemptedSubmit.value = false
    } catch (err: any) {
      showToast('エラー', `エラーが発生しました: ${err.message}`, 'error')
    } finally {
      loading.value = false
    }
  }

  return {
    form,
    loading,
    hasAttemptedSubmit,
    errors,
    isFormInvalid,
    handleSubmit,
  }
}

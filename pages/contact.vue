<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-center mb-8 text-foreground">
      お問い合わせ
    </h1>
    <div class="text-card-foreground rounded shadow-md dark:shadow-sky-500/20 border-0 p-8 pt-8">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div>
            <Label for="name">お名前</Label>
            <Input id="name" v-model="form.name" name="name" type="text" class="mt-1" placeholder="山田 太郎" />
            <p v-if="errors.name" class="text-sm text-red-500 mt-1">{{ errors.name }}</p>
          </div>
          <div>
            <Label for="email">返信先メールアドレス</Label>
            <Input id="email" v-model="form.email" name="email" type="email" autocomplete="email" class="mt-1" placeholder="your-email@example.com" />
            <p v-if="errors.email" class="text-sm text-red-500 mt-1">{{ errors.email }}</p>
          </div>
          <div>
            <Label for="subject">件名</Label>
            <Input id="subject" v-model="form.subject" name="subject" type="text" class="mt-1" placeholder="件名を入力してください" />
            <p v-if="errors.subject" class="text-sm text-red-500 mt-1">{{ errors.subject }}</p>
          </div>
          <div>
            <Label for="message">お問い合わせ内容</Label>
            <Textarea id="message" v-model="form.message" name="message" :rows="4" class="mt-1" placeholder="お問い合わせ内容を入力してください" />
            <p v-if="errors.message" class="text-sm text-red-500 mt-1">{{ errors.message }}</p>
          </div>
          <div class="pt-2">
            <Button type="submit" :disabled="loading || (hasAttemptedSubmit && isFormInvalid)" class="w-full">
              <span v-if="loading">送信中...</span>
              <span v-else>送信</span>
            </Button>
          </div>
        </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { z } from 'zod'
import Input from '~/components/ui/form/Input.vue'
import Label from '~/components/ui/form/Label.vue'
import Textarea from '~/components/ui/form/Textarea.vue'
import Button from '~/components/ui/button/Button.vue'

const { showToast } = useAlert()

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
const supabase = useSupabaseClient()

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

    showToast('成功', 'お問い合わせいただきありがとうございます。メッセージは正常に送信されました。')
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
</script>

<template>
  <div class="container py-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-center mb-8 text-foreground">
        お問い合わせ
      </h1>
      <form class="bg-card p-8 rounded-lg shadow-md space-y-6" @submit.prevent="handleSubmit">
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
          <Button type="submit" :disabled="loading || isFormInvalid" class="w-full">
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
import Input from '~/components/ui/Input.vue'
import Label from '~/components/ui/Label.vue'
import Textarea from '~/components/ui/Textarea.vue'
import Button from '~/components/ui/Button.vue'

const { showAlert } = useAlert()

// --- Form State ---
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})
const loading = ref(false)

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
watch(() => form.value.name, () => { if (errors.value.name) validate() })
watch(() => form.value.email, () => { if (errors.value.email) validate() })
watch(() => form.value.subject, () => { if (errors.value.subject) validate() })
watch(() => form.value.message, () => { if (errors.value.message) validate() })

// --- Submission ---
const supabase = useSupabaseClient()

async function handleSubmit() {
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

    showAlert('成功', 'お問い合わせいただきありがとうございます。メッセージは正常に送信されました。')
    // フォームをリセット
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: '',
    }
    // エラーもリセット
    errors.value = {}
  } catch (err: any) {
    showAlert('エラー', `エラーが発生しました: ${err.message}`, 'error')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container py-12">
    <UiCard class="max-w-2xl mx-auto">
      <UiCardHeader>
        <UiCardTitle class="text-2xl font-bold text-center">お問い合わせ</UiCardTitle>
        <UiCardDescription class="text-center">ご不明な点がございましたら、お気軽にお問い合わせください。</UiCardDescription>
      </UiCardHeader>
      <UiCardContent>
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <div v-if="successMsg" class="p-4 text-green-700 bg-green-100 border-l-4 border-green-500">
            <p>{{ successMsg }}</p>
          </div>
          <div v-if="errorMsg" class="p-4 text-red-700 bg-red-100 border-l-4 border-red-500">
            <p>{{ errorMsg }}</p>
          </div>

          <div class="space-y-4">
            <div class="grid gap-2">
              <UiLabel for="name">お名前</UiLabel>
              <UiInput id="name" v-model="form.name" name="name" type="text" required placeholder="山田 太郎" />
            </div>
            <div class="grid gap-2">
              <UiLabel for="email">返信先メールアドレス</UiLabel>
              <UiInput id="email" v-model="form.email" name="email" type="email" autocomplete="email" required placeholder="your-email@example.com" />
            </div>
            <div class="grid gap-2">
              <UiLabel for="subject">件名</UiLabel>
              <UiInput id="subject" v-model="form.subject" name="subject" type="text" required placeholder="件名を入力してください" />
            </div>
            <div class="grid gap-2">
              <UiLabel for="message">お問い合わせ内容</UiLabel>
              <UiTextarea id="message" v-model="form.message" name="message" required placeholder="お問い合わせ内容を入力してください" />
            </div>
          </div>

          <div>
            <UiButton type="submit" :disabled="loading" class="w-full">
              <span v-if="loading">送信中...</span>
              <span v-else>送信</span>
            </UiButton>
          </div>
        </form>
      </UiCardContent>
    </UiCard>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const supabase = useSupabaseClient()
const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const loading = ref(false)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

async function handleSubmit() {
  loading.value = true
  errorMsg.value = null
  successMsg.value = null

  try {
    const { error } = await supabase.functions.invoke('contact', {
      body: form.value,
    })

    if (error) {
      throw new Error(error.message)
    }

    successMsg.value = 'お問い合わせいただきありがとうございます。メッセージは正常に送信されました。'
    // フォームをリセット
    form.value = {
      name: '',
      email: '',
      subject: '',
      message: '',
    }
  } catch (err: any) {
    errorMsg.value = `エラーが発生しました: ${err.message}`
  } finally {
    loading.value = false
  }
}
</script>

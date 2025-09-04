<template>
  <div class="container py-8">
    <div class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-center mb-8 text-foreground">
        お問い合わせ
      </h1>
      <form class="bg-card p-8 rounded-lg shadow-md space-y-6" @submit.prevent="handleSubmit">
        <div>
          <Label for="name">お名前</Label>
          <Input id="name" v-model="form.name" name="name" type="text" required class="mt-1" placeholder="山田 太郎" />
        </div>
        <div>
          <Label for="email">返信先メールアドレス</Label>
          <Input id="email" v-model="form.email" name="email" type="email" autocomplete="email" required class="mt-1" placeholder="your-email@example.com" />
        </div>
        <div>
          <Label for="subject">件名</Label>
          <Input id="subject" v-model="form.subject" name="subject" type="text" required class="mt-1" placeholder="件名を入力してください" />
        </div>
        <div>
          <Label for="message">お問い合わせ内容</Label>
          <Textarea id="message" v-model="form.message" name="message" :rows="4" required class="mt-1" placeholder="お問い合わせ内容を入力してください" />
        </div>
        <div class="pt-2">
          <Button type="submit" :disabled="loading" class="w-full">
            <span v-if="loading">送信中...</span>
            <span v-else>送信</span>
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Input from '~/components/ui/Input.vue'
import Label from '~/components/ui/Label.vue'
import Textarea from '~/components/ui/Textarea.vue'
import Button from '~/components/ui/Button.vue'

const supabase = useSupabaseClient()
const { alert, showAlert } = useAlert()

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
})

const loading = ref(false)

async function handleSubmit() {
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
  } catch (err: any) {
    showAlert('エラー', `エラーが発生しました: ${err.message}`, 'error')
  } finally {
    loading.value = false
  }
}
</script>

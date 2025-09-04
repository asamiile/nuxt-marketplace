<template>
  <div class="container py-8">
    <div class="w-full max-w-lg mx-auto space-y-8">
      <div>
        <h2 class="mt-6 text-3xl font-extrabold text-center text-gray-900">
          お問い合わせ
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4 rounded-md shadow-sm">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">お名前</label>
            <input id="name" v-model="form.name" name="name" type="text" required class="relative block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="山田 太郎">
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">返信先メールアドレス</label>
            <input id="email" v-model="form.email" name="email" type="email" autocomplete="email" required class="relative block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="your-email@example.com">
          </div>
          <div>
            <label for="subject" class="block text-sm font-medium text-gray-700">件名</label>
            <input id="subject" v-model="form.subject" name="subject" type="text" required class="relative block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="件名を入力してください">
          </div>
          <div>
            <label for="message" class="block text-sm font-medium text-gray-700">お問い合わせ内容</label>
            <textarea id="message" v-model="form.message" name="message" rows="4" required class="relative block w-full px-3 py-2 mt-1 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="お問い合わせ内容を入力してください"></textarea>
          </div>
        </div>

        <div>
          <button type="submit" :disabled="loading" class="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 disabled:cursor-not-allowed">
            <span v-if="loading">送信中...</span>
            <span v-else>送信</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

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

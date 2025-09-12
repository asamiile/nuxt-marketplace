<template>
  <div class="flex items-center justify-center min-h-full">
    <div class="w-full max-w-md space-y-8">
      <div>
        <h2 class="text-3xl font-extrabold text-center text-foreground">
          パスワードをリセット
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          パスワード再設定用のリンクを記載したメールを送信します。
        </p>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handlePasswordReset">
        <div class="space-y-4 rounded-md">
          <div>
            <Label for="email-address">メールアドレス</Label>
            <Input id="email-address" v-model="email" name="email" type="email" autocomplete="email" required placeholder="メールアドレス" />
          </div>
        </div>

        <div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? '送信中...' : 'リセットメールを送信' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSupabaseClient } from '#imports'
import { useAlert } from '~/composables/useAlert'
import Input from '~/components/ui/input/Input.vue'
import Button from '~/components/ui/button/Button.vue'
import Label from '~/components/ui/label/Label.vue'

const supabase = useSupabaseClient()
const { showToast } = useAlert()

const email = ref('')
const loading = ref(false)

const handlePasswordReset = async () => {
  if (!email.value) {
    showToast('エラー', 'メールアドレスを入力してください。', 'error')
    return
  }
  loading.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email.value, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    if (error) throw error
    showToast('成功', 'パスワード再設定メールを送信しました。メールをご確認ください。')
  } catch (error: any) {
    showToast('エラー', error.message, 'error')
  } finally {
    loading.value = false
  }
}

definePageMeta({
  layout: 'default',
})
</script>

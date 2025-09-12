<template>
  <div class="flex items-center justify-center min-h-full">
    <div class="w-full max-w-md space-y-8">
      <div>
        <h2 class="text-3xl font-extrabold text-center text-foreground">
          新しいパスワードを設定
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleUpdatePassword">
        <div class="space-y-4 rounded-md">
          <div>
            <Label for="new-password">新しいパスワード</Label>
            <Input id="new-password" v-model="password" name="password" type="password" required placeholder="新しいパスワード" />
          </div>
          <div>
            <Label for="confirm-password">新しいパスワード（確認用）</Label>
            <Input id="confirm-password" v-model="confirmPassword" name="confirm-password" type="password" required placeholder="新しいパスワードを再入力" />
          </div>
        </div>

        <div>
          <Button type="submit" class="w-full" :disabled="loading">
            {{ loading ? '更新中...' : 'パスワードを更新' }}
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
import { useErrorTranslator } from '~/composables/useErrorTranslator'
import Input from '~/components/ui/form/Input.vue'
import Button from '~/components/ui/button/ButtonA.vue'
import Label from '~/components/ui/form/Label.vue'

const supabase = useSupabaseClient()
const router = useRouter()
const { showToast } = useAlert()
const { translateError } = useErrorTranslator()

const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)


const handleUpdatePassword = async () => {
  if (password.value !== confirmPassword.value) {
    showToast('エラー', 'パスワードが一致しません。', 'error')
    return
  }
  if (!password.value) {
    showToast('エラー', 'パスワードを入力してください。', 'error')
    return
  }

  loading.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: password.value,
    })
    if (error) throw error
    showToast('成功', 'パスワードが正常に更新されました。')
    router.push('/login')
  } catch (error: any) {
    showToast('エラー', translateError(error.message), 'error')
  } finally {
    loading.value = false
  }
}

definePageMeta({
  layout: 'default',
})
</script>

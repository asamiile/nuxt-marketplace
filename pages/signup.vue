<template>
  <div class="flex items-center justify-center min-h-full">
    <div class="w-full max-w-md space-y-8">
      <div>
        <h2 class="text-3xl font-extrabold text-center text-foreground">
          アカウントを作成
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="signUp">
        <div class="space-y-4 rounded-md">
          <div>
            <Label for="email-address">メールアドレス</Label>
            <Input id="email-address" v-model="email" name="email" type="email" autocomplete="email" class="mt-1" placeholder="メールアドレス" />
            <p v-if="errors.email" class="text-sm text-red-400 mt-1">{{ errors.email }}</p>
          </div>
          <div>
            <Label for="password">パスワード</Label>
            <Input id="password" v-model="password" name="password" type="password" autocomplete="new-password" class="mt-1" placeholder="パスワード" />
            <p v-if="errors.password" class="text-sm text-red-400 mt-1">{{ errors.password }}</p>
          </div>
        </div>

        <div>
          <Button type="submit" :disabled="loading || (hasAttemptedSubmit && isFormInvalid)" class="w-full" :class="buttonVariants({ variant: 'gradient-blue' })">
            <span v-if="loading">登録中...</span>
            <span v-else>新規登録</span>
          </Button>
        </div>
      </form>
      <div v-if="errorMsg" class="p-4 text-center text-red-400 bg-red-500/10 rounded-md">{{ errorMsg }}</div>
      <div v-if="successMsg" class="p-4 text-center text-green-500 bg-green-500/10 rounded-md">{{ successMsg }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { z } from 'zod'
import { buttonVariants } from '~/components/ui/button'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import Button from '~/components/ui/button/Button.vue'

const supabase = useSupabaseClient()
const router = useRouter()

// --- Form & State ---
const email = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)
const loading = ref(false)
const hasAttemptedSubmit = ref(false)

// --- Validation ---
const errors = ref<Record<string, string>>({})
const signupSchema = z.object({
  email: z.string().email({ message: "有効なメールアドレスを入力してください。" }),
  password: z.string().min(6, { message: "パスワードは6文字以上で入力してください。" }),
})

const isFormInvalid = computed(() => {
  return !signupSchema.safeParse({ email: email.value, password: password.value }).success
})

const validate = () => {
  const result = signupSchema.safeParse({ email: email.value, password: password.value })
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

watch(email, () => { if (hasAttemptedSubmit.value) validate() })
watch(password, () => { if (hasAttemptedSubmit.value) validate() })

// --- Auth Logic ---
async function signUp() {
  hasAttemptedSubmit.value = true
  if (!validate()) return

  loading.value = true
  errorMsg.value = null
  successMsg.value = null
  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })

    if (error) throw error

    // Always show the confirmation message, as per Supabase security best practices.
    successMsg.value = 'アカウントを確認するため、ご入力のメールアドレスに送信されたメールを確認してください。'
    setTimeout(() => {
      router.push('/login')
    }, 5000)

  } catch (error: any) {
    errorMsg.value = 'アカウントの作成中にエラーが発生しました。'
  } finally {
    loading.value = false
  }
}
</script>

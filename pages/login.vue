<template>
  <div class="flex items-center justify-center min-h-full">
    <div class="w-full max-w-md space-y-8">
      <div>
        <h2 class="text-3xl font-extrabold text-center text-foreground">
          アカウントにサインイン
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="signInWithPassword">
        <div class="space-y-4 rounded-md">
          <div>
            <Label for="email-address">メールアドレス</Label>
            <Input id="email-address" v-model="email" name="email" type="email" autocomplete="email" :required="false" class="mt-1" placeholder="メールアドレス" />
            <p v-if="errors.email" class="text-sm text-red-400 mt-1">{{ errors.email }}</p>
          </div>
          <div>
            <Label for="password">パスワード</Label>
            <Input id="password" v-model="password" name="password" type="password" autocomplete="current-password" :required="false" class="mt-1" placeholder="パスワード" />
             <p v-if="errors.password" class="text-sm text-red-400 mt-1">{{ errors.password }}</p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <NuxtLink to="/forgot-password" class="font-medium text-cyan-600 hover:text-cyan-500">
              パスワードをお忘れですか？
            </NuxtLink>
          </div>
        </div>

        <div>
          <Button type="submit" :disabled="loading || (hasAttemptedSubmit && isFormInvalid)" class="w-full text-white bg-gradient-blue hover:opacity-90">
            <span v-if="loading">サインイン中...</span>
            <span v-else>サインイン</span>
          </Button>
        </div>
      </form>
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-border"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-background text-foreground">または以下で続ける</span>
        </div>
      </div>
      <div>
        <Button @click="signInWithGoogle" class="w-full" variant="outline">
          Googleでサインイン
        </Button>
      </div>
       <div v-if="errorMsg" class="p-4 text-center text-red-400 bg-red-500/10 rounded-md">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { z } from 'zod'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import Button from '~/components/ui/button/Button.vue'

const supabase = useSupabaseClient()
const router = useRouter()

// --- Form & Error State ---
const email = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)
const loading = ref(false)
const hasAttemptedSubmit = ref(false)

// --- Validation ---
const errors = ref<Record<string, string>>({})
const loginSchema = z.object({
  email: z.string().email({ message: "有効なメールアドレスを入力してください。" }),
  password: z.string().min(6, { message: "パスワードは6文字以上で入力してください。" }),
})

const isFormInvalid = computed(() => {
  return !loginSchema.safeParse({ email: email.value, password: password.value }).success
})

const validate = () => {
  const result = loginSchema.safeParse({ email: email.value, password: password.value })
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
async function signInWithPassword() {
  hasAttemptedSubmit.value = true
  if (!validate()) return

  loading.value = true
  errorMsg.value = null
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    // The redirect is handled by the watcher now.
  } catch (error: any) {
    errorMsg.value = "メールアドレスまたはパスワードが正しくありません。"
  } finally {
    loading.value = false
  }
}

async function signInWithGoogle() {
  loading.value = true
  errorMsg.value = null
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) throw error
  } catch (error: any) {
    errorMsg.value = "Googleでのサインイン中にエラーが発生しました。"
  } finally {
    loading.value = false
  }
}

const user = useCurrentUser()
watch(user, () => {
  if (user.value) {
    router.push('/')
  }
}, { immediate: true })
</script>

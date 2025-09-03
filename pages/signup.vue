<template>
  <div class="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div>
        <h2 class="mt-6 text-3xl font-extrabold text-center text-foreground">
          アカウントを作成
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="signUp">
        <div class="space-y-2 rounded-md shadow-sm">
          <div>
            <label for="email-address" class="sr-only">メールアドレス</label>
            <input id="email-address" v-model="email" name="email" type="email" autocomplete="email" required class="relative block w-full px-3 py-2 bg-background text-foreground placeholder-gray-500 border border-border rounded-none appearance-none rounded-t-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm" placeholder="メールアドレス">
          </div>
          <div>
            <label for="password" class="sr-only">パスワード</label>
            <input id="password" v-model="password" name="password" type="password" autocomplete="current-password" required class="relative block w-full px-3 py-2 bg-background text-foreground placeholder-gray-500 border border-border rounded-none appearance-none rounded-b-md focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 focus:z-10 sm:text-sm" placeholder="パスワード">
          </div>
        </div>

        <div>
          <button type="submit" class="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500">
            新規登録
          </button>
        </div>
      </form>
      <div v-if="errorMsg" class="text-red-500">{{ errorMsg }}</div>
      <div v-if="successMsg" class="text-green-500">{{ successMsg }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

async function signUp() {
  try {
    errorMsg.value = null
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    if (!data.user) throw new Error('User data is null after sign up.')

    successMsg.value = 'アカウントを確認するため、メールを確認してください。'
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  } catch (error: any) {
    errorMsg.value = error.message
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-full px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div>
        <h2 class="mt-6 text-3xl font-extrabold text-center text-foreground">
          アカウントにサインイン
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="signInWithPassword">
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
            サインイン
          </button>
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
        <button @click="signInWithGoogle" class="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-pink-500 bg-white border border-pink-500 rounded-md shadow-sm hover:bg-pink-50 dark:bg-transparent dark:text-pink-400 dark:border-pink-400 dark:hover:bg-pink-950/50">
          Googleでサインイン
        </button>
      </div>
       <div v-if="errorMsg" class="text-red-500">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)

async function signInWithPassword() {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    router.push('/')
  } catch (error: any) {
    errorMsg.value = error.message
  }
}

async function signInWithGoogle() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) throw error
  } catch (error: any) {
    errorMsg.value = error.message
  }
}

const user = useCurrentUser()
watch(user, () => {
  if (user.value) {
    router.push('/')
  }
}, { immediate: true })
</script>

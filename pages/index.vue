<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold">サイトへようこそ</h1>
    <div v-if="user">
      <p class="mt-4">{{ user.email }} でログイン中です</p>
      <button @click="signOut" class="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
        ログアウト
      </button>
    </div>
    <div v-else>
      <p class="mt-4">ログインしていません。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useCurrentUser()
const supabase = useSupabaseClient()
const router = useRouter()

async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
  } else {
    router.push('/login')
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold">Welcome to the site</h1>
    <div v-if="user">
      <p class="mt-4">You are logged in as {{ user.email }}</p>
      <button @click="signOut" class="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700">
        Sign Out
      </button>
    </div>
    <div v-else>
      <p class="mt-4">You are not logged in.</p>
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

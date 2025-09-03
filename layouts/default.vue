<template>
  <div class="flex flex-col min-h-screen">
    <header class="bg-card border-b border-border">
      <nav class="container">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-bold">
              SiteLogo
            </NuxtLink>
          </div>
          <div class="flex items-center space-x-4">
            <template v-if="user">
              <NuxtLink to="/sell" class="px-4 py-2 text-sm font-medium text-white rounded-md bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500">
                出品する
              </NuxtLink>
              <div ref="dropdownRef" class="relative">
                <button @click="isMenuOpen = !isMenuOpen" class="flex items-center p-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                  <span class="inline-block w-8 h-8 bg-gray-400 dark:bg-gray-600 rounded-full"></span>
                </button>
                <div v-if="isMenuOpen" class="absolute right-0 w-48 mt-2 origin-top-right bg-card rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10">
                  <NuxtLink to="/dashboard" @click="isMenuOpen = false" class="block px-4 py-2 text-sm text-card-foreground hover:bg-secondary">ダッシュボード</NuxtLink>
                  <button @click="signOut" class="w-full text-left block px-4 py-2 text-sm text-card-foreground hover:bg-secondary">
                    ログアウト
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="px-3 py-2 text-sm font-medium rounded-md hover:text-foreground/80">
                ログイン
              </NuxtLink>
              <NuxtLink to="/signup" class="px-4 py-2 text-sm font-medium text-white rounded-md bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600">
                新規登録
              </NuxtLink>
            </template>
          </div>
        </div>
      </nav>
    </header>

    <main class="flex-grow container py-20">
      <slot />
    </main>

    <footer class="bg-card border-t border-border">
      <div class="container py-8">
        <div class="flex justify-center space-x-6">
          <NuxtLink to="/terms" class="text-sm text-foreground/70 hover:text-foreground">利用規約</NuxtLink>
          <NuxtLink to="/privacy" class="text-sm text-foreground/70 hover:text-foreground">プライバシーポリシー</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const user = useCurrentUser()
const supabase = useSupabaseClient()
const router = useRouter()
const isMenuOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isMenuOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})


async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error(error)
  } else {
    isMenuOpen.value = false
    router.push('/login')
  }
}
</script>

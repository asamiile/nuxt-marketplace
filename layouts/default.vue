<template>
  <div class="flex flex-col min-h-screen text-primary">
    <header class="bg-gray-100 border-b border-gray-200">
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
                  <span class="inline-block w-8 h-8 bg-gray-400 rounded-full"></span>
                </button>
                <div v-if="isMenuOpen" class="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10">
                  <NuxtLink to="/dashboard" class="block px-4 py-2 text-sm text-primary hover:bg-gray-100">ダッシュボード</NuxtLink>
                  <button @click="signOut" class="w-full text-left block px-4 py-2 text-sm text-primary hover:bg-gray-100">
                    ログアウト
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="px-3 py-2 text-sm font-medium text-primary rounded-md hover:text-black">
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

    <footer class="bg-gray-100 border-t border-gray-200">
      <div class="container py-8">
        <div class="flex justify-center space-x-6">
          <NuxtLink to="/terms" class="text-sm text-primary/70 hover:text-primary">利用規約</NuxtLink>
          <NuxtLink to="/privacy" class="text-sm text-primary/70 hover:text-primary">プライバシーポリシー</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useClickOutside } from '~/composables/useClickOutside'

const user = useCurrentUser()
const supabase = useSupabaseClient()
const router = useRouter()
const isMenuOpen = ref(false)
const dropdownRef = ref<HTMLElement>()

useClickOutside(dropdownRef, () => {
  isMenuOpen.value = false
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

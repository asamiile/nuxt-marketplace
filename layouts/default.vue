<template>
  <div class="flex flex-col min-h-screen">
    <header class="bg-gray-100 border-b border-gray-200">
      <nav class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">
          <div class="flex items-center">
            <NuxtLink to="/" class="text-xl font-bold">
              SiteLogo
            </NuxtLink>
          </div>
          <div class="flex items-center space-x-4">
            <template v-if="user">
              <NuxtLink to="/sell" class="px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 hover:bg-gray-50">
                出品する
              </NuxtLink>
              <div class="relative" ref="menu">
                <button @click="isMenuOpen = !isMenuOpen" class="flex items-center p-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span class="inline-block w-8 h-8 bg-gray-400 rounded-full"></span>
                </button>
                <div v-if="isMenuOpen" class="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10">
                  <NuxtLink to="/dashboard" @click="isMenuOpen = false" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">ダッシュボード</NuxtLink>
                  <button @click="signOut" class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    ログアウト
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-gray-900">
                ログイン
              </NuxtLink>
              <NuxtLink to="/signup" class="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                新規登録
              </NuxtLink>
            </template>
          </div>
        </div>
      </nav>
    </header>

    <main class="flex-grow">
      <slot />
    </main>

    <footer class="bg-gray-100 border-t border-gray-200">
      <div class="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-center space-x-6">
          <NuxtLink to="/terms" class="text-sm text-gray-500 hover:text-gray-900">利用規約</NuxtLink>
          <NuxtLink to="/privacy" class="text-sm text-gray-500 hover:text-gray-900">プライバシーポリシー</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'

const user = useCurrentUser()
const supabase = useSupabaseClient()
const router = useRouter()
const isMenuOpen = ref(false)
const menu = ref<HTMLElement | null>(null)

const handleClickOutside = (event: MouseEvent) => {
  if (menu.value && !menu.value.contains(event.target as Node)) {
    isMenuOpen.value = false
  }
}

watch(isMenuOpen, (isOpen) => {
  if (isOpen) {
    document.addEventListener('click', handleClickOutside)
  } else {
    document.removeEventListener('click', handleClickOutside)
  }
})

onBeforeUnmount(() => {
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

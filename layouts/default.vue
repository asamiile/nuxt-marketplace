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
                {{ $t('header.sell') }}
              </NuxtLink>
              <div class="relative">
                <button @click="isMenuOpen = !isMenuOpen" class="flex items-center p-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span class="inline-block w-8 h-8 bg-gray-400 rounded-full"></span>
                </button>
                <div v-if="isMenuOpen" class="absolute right-0 w-48 mt-2 origin-top-right bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10">
                  <NuxtLink to="/dashboard" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">{{ $t('header.dashboard') }}</NuxtLink>
                  <button @click="signOut" class="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    {{ $t('header.logout') }}
                  </button>
                </div>
              </div>
            </template>
            <template v-else>
              <NuxtLink to="/login" class="px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:text-gray-900">
                {{ $t('header.login') }}
              </NuxtLink>
              <NuxtLink to="/signup" class="px-3 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                {{ $t('header.signup') }}
              </NuxtLink>
            </template>
            <div class="ml-4">
              <select v-model="locale" class="px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-md border border-gray-300 focus:outline-none">
                <option value="ja">日本語</option>
                <option value="en">English</option>
              </select>
            </div>
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
          <NuxtLink to="/terms" class="text-sm text-gray-500 hover:text-gray-900">{{ $t('footer.terms') }}</NuxtLink>
          <NuxtLink to="/privacy" class="text-sm text-gray-500 hover:text-gray-900">{{ $t('footer.privacy') }}</NuxtLink>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { locale, locales } = useI18n()
const user = useCurrentUser()
const supabase = useSupabaseClient()
const router = useRouter()
const isMenuOpen = ref(false)

const availableLocales = computed(() => {
  return locales.value.filter(i => i.code !== locale.value)
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

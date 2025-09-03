<template>
  <header class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-14 items-center">
      <div class="mr-4 hidden md:flex">
        <NuxtLink to="/" class="mr-6 flex items-center space-x-2">
          <span class="font-bold">SiteLogo</span>
        </NuxtLink>
        <nav class="flex items-center space-x-6 text-sm font-medium">
          <!-- Add any main navigation links here if needed -->
        </nav>
      </div>
      <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <div class="w-full flex-1 md:w-auto md:flex-none">
          <!-- You can add a search bar here if needed -->
        </div>
        <nav class="flex items-center">
          <template v-if="user">
            <NuxtLink to="/sell" :class="buttonVariants({ variant: 'ghost', class: 'mr-2' })">
              出品する
            </NuxtLink>
            <div ref="dropdownRef" class="relative">
            <UiButton @click="isMenuOpen = !isMenuOpen" variant="ghost" class="relative h-8 w-8 rounded-full">
                <span class="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                  <span class="flex h-full w-full items-center justify-center rounded-full bg-muted">
                    {{ user.email?.charAt(0).toUpperCase() }}
                  </span>
                </span>
            </UiButton>
              <div v-if="isMenuOpen" class="absolute right-0 w-56 mt-2 origin-top-right bg-popover text-popover-foreground rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div class="py-1">
                  <div class="px-4 py-2">
                    <p class="text-sm">Signed in as</p>
                    <p class="text-sm font-medium truncate">{{ user.email }}</p>
                  </div>
                  <div class="border-t border-border"></div>
                  <NuxtLink to="/dashboard" @click="isMenuOpen = false" class="block px-4 py-2 text-sm hover:bg-accent">ダッシュボード</NuxtLink>
                  <button @click="signOut" class="w-full text-left block px-4 py-2 text-sm hover:bg-accent">
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <NuxtLink to="/login" :class="buttonVariants({ variant: 'ghost', class: 'mr-2' })">
              ログイン
            </NuxtLink>
            <NuxtLink to="/signup" :class="buttonVariants({ variant: 'default' })">
              新規登録
            </NuxtLink>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { buttonVariants } from '~/components/ui/buttonVariants'

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
    await router.push('/login')
  }
}
</script>

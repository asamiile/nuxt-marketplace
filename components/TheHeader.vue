<template>
  <header class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
    <div class="container flex h-14 items-center">
      <div class="mr-4 hidden md:flex">
        <NuxtLink to="/" class="mr-6 flex items-center space-x-2">
          <span class="font-bold">Marketplace</span>
        </NuxtLink>
        <nav class="flex items-center space-x-6 text-sm font-medium">
          <!-- Add any main navigation links here if needed -->
        </nav>
      </div>
      <div class="flex flex-1 items-center justify-between space-x-2 md:justify-end">
        <div class="w-full flex-1 md:w-auto md:flex-none">
          <!-- You can add a search bar here if needed -->
        </div>
        <nav class="flex items-center gap-4">
          <template v-if="user">
            <NuxtLink to="/sell" :class="buttonVariants({ variant: 'gradient-pink' })">
              出品する
            </NuxtLink>
            <div ref="dropdownRef" class="relative">
              <button @click="isMenuOpen = !isMenuOpen" class="flex items-center justify-center h-9 w-9 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 border-2 border-background">
                <template v-if="profile">
                  <template v-if="profile.avatar_url">
                    <img :src="profile.avatar_url" alt="User Avatar" class="h-full w-full rounded-full object-cover">
                  </template>
                  <template v-else>
                    <span class="text-lg font-semibold">
                      {{ profile.username?.charAt(0).toUpperCase() }}
                    </span>
                  </template>
                </template>
                <template v-else>
                  <!-- Fallback while profile is loading -->
                  <span class="text-lg font-semibold">
                    {{ user.email?.charAt(0).toUpperCase() }}
                  </span>
                </template>
              </button>
              <div v-if="isMenuOpen && profile" class="absolute right-0 w-56 mt-2 origin-top-right bg-card border rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div class="px-1 py-1">
                  <div class="px-4 py-2">
                    <p class="text-sm font-medium text-foreground">
                      {{ profile.username }}
                    </p>
                    <p class="text-xs text-muted-foreground truncate">
                      {{ user.email }}
                    </p>
                  </div>
                  <div class="my-1 h-px bg-border" />
                  <NuxtLink :to="`/creator/${profile.username}`" @click="isMenuOpen = false" class="block px-4 py-2 text-sm text-card-foreground hover:bg-secondary">
                    クリエイターページ
                  </NuxtLink>
                  <NuxtLink to="/favorites" @click="isMenuOpen = false" class="block px-4 py-2 text-sm text-card-foreground hover:bg-secondary">
                    お気に入り商品
                  </NuxtLink>
                  <NuxtLink to="/dashboard" @click="isMenuOpen = false" class="block px-4 py-2 text-sm text-card-foreground hover:bg-secondary">
                    ダッシュボード
                  </NuxtLink>
                  <div class="my-1 h-px bg-border" />
                  <button @click="signOut" class="w-full text-left block px-4 py-2 text-sm text-destructive hover:bg-destructive/10">
                    ログアウト
                  </button>
                </div>
              </div>
            </div>
          </template>
          <template v-else>
            <NuxtLink to="/login" :class="buttonVariants({ variant: 'ghost' })">
              ログイン
            </NuxtLink>
            <NuxtLink to="/signup" :class="buttonVariants({ variant: 'default', class: 'ml-2' })">
              新規登録
            </NuxtLink>
          </template>
        </nav>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watchEffect } from 'vue'
import { buttonVariants } from '~/components/ui/button/buttonVariants'
import type { Profile } from '~/types/profile'

const user = useCurrentUser()
const supabase = useSupabaseClient()
const router = useRouter()

const isMenuOpen = ref(false)
const dropdownRef = ref<HTMLElement>()
const profile = ref<Profile | null>(null)

watchEffect(async () => {
  if (user.value) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, avatar_url')
        .eq('id', user.value.id)
        .single()

      if (error) {
        throw error
      }
      profile.value = data
    } catch (error) {
      console.error('Error fetching profile:', error)
      profile.value = null
    }
  }
})

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
    profile.value = null // Clear profile on sign out
    await router.push('/login')
  }
}
</script>
<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden">
    <Toaster />
    <!-- Sidebar -->
    <aside
      class="fixed inset-y-0 left-0 z-30 w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700 transform transition-transform duration-300 ease-in-out"
      :class="{ '-translate-x-full': !isSidebarOpen }"
    >
      <div class="h-full flex flex-col">
        <div class="px-4 py-6 flex justify-between items-center">
          <h2 class="text-2xl font-semibold text-gray-800 dark:text-white">Admin</h2>
          <button @click="isSidebarOpen = false" class="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white md:hidden">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <nav class="flex-1 px-2 py-4 space-y-2">
          <NuxtLink
            v-for="item in menuItems"
            :key="item.to"
            :to="item.to"
            @click="handleLinkClick"
            class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            exact-active-class="bg-gray-300 dark:bg-gray-700"
          >
            <span class="mx-4">{{ item.name }}</span>
          </NuxtLink>
        </nav>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0">
      <header class="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b dark:border-gray-700 md:justify-end">
        <button @click="isSidebarOpen = true" class="text-gray-600 dark:text-gray-300 focus:outline-none md:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-6 w-6"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <NuxtLink to="/" class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 hover:text-primary-foreground text-sm">ストアフロントへ</NuxtLink>
      </header>
      <main
        class="flex-1 p-6 overflow-y-auto transition-all duration-300 ease-in-out min-w-0"
        :class="{ 'md:ml-64': isSidebarOpen }"
      >
        <slot />
      </main>
    </div>

    <!-- Overlay for mobile -->
    <div
      v-if="isSidebarOpen"
      @click="isSidebarOpen = false"
      class="fixed inset-0 bg-black opacity-50 z-20 md:hidden"
    ></div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Toaster from '~/components/ui/toast/Toaster.vue'

const isSidebarOpen = ref(true)

const menuItems = [
  { to: '/admin/products', name: '商品一覧' },
  { to: '/admin/categories', name: 'カテゴリ管理' },
  { to: '/admin/tags', name: 'タグ管理' },
  { to: '/admin/purchases', name: '購入管理' },
  { to: '/admin/users', name: 'ユーザ管理' },
  { to: '/admin/contacts', name: 'お問い合わせ管理' },
]

const handleResize = () => {
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false
  } else {
    isSidebarOpen.value = true
  }
}

const handleLinkClick = () => {
  if (window.innerWidth < 768) {
    isSidebarOpen.value = false;
  }
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/* Scoped styles for the admin layout */
</style>

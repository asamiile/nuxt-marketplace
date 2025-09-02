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
              <div>
                <!-- Profile menu placeholder -->
                <button class="flex items-center p-2 text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  <span class="inline-block w-8 h-8 bg-gray-400 rounded-full"></span>
                </button>
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
const user = useCurrentUser()
</script>

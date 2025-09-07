<template>
  <div class="flex h-screen bg-gray-100 dark:bg-gray-900">
    <!-- Sidebar -->
    <aside class="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r dark:border-gray-700">
      <div class="h-full flex flex-col">
        <div class="px-4 py-6">
          <h2 class="text-2xl font-semibold text-gray-800 dark:text-white">Admin Panel</h2>
        </div>
        <nav class="flex-1 px-2 py-4 space-y-2">
          <NuxtLink
            to="/admin"
            class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            exact-active-class="bg-gray-300 dark:bg-gray-700"
          >
            <span class="mx-4">ダッシュボード</span>
          </NuxtLink>
          <NuxtLink
            to="/admin/categories"
            class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            exact-active-class="bg-gray-300 dark:bg-gray-700"
          >
            <span class="mx-4">カテゴリ管理</span>
          </NuxtLink>
          <NuxtLink
            to="/admin/tags"
            class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            exact-active-class="bg-gray-300 dark:bg-gray-700"
          >
            <span class="mx-4">タグ管理</span>
          </NuxtLink>
          <NuxtLink
            to="/admin/purchases"
            class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            exact-active-class="bg-gray-300 dark:bg-gray-700"
          >
            <span class="mx-4">購入管理</span>
          </NuxtLink>
          <NuxtLink
            to="/admin/contacts"
            class="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            exact-active-class="bg-gray-300 dark:bg-gray-700"
          >
            <span class="mx-4">お問い合わせ管理</span>
          </NuxtLink>
        </nav>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 p-6 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
/* Scoped styles for the admin layout */
</style>

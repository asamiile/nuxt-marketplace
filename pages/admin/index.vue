<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">ダッシュボード</h1>
    <div class="p-6 bg-white dark:bg-gray-800 rounded-lg">
      <h2 class="text-xl font-semibold mb-4">ようこそ、管理者パネルへ</h2>
      <p class="text-gray-600 dark:text-gray-300">
        左側のナビゲーションメニューから、管理したい項目を選択してください。
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})
</script>

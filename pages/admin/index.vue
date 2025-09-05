<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">ようこそ、管理者パネルへ</h1>
    <p class="text-lg">左のメニューから操作を選択してください。</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <div class="text-center">
      <p class="text-lg text-gray-600 dark:text-gray-400">認証情報を処理しています...</p>
      <p class="text-lg text-gray-600 dark:text-gray-400">まもなくリダイレクトされます。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const user = useSupabaseUser();
const router = useRouter();

watch(
  user,
  () => {
    if (user.value) {
      // User is logged in, redirect to home.
      router.push('/');
    }
  },
  { immediate: true }
);
</script>

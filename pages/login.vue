<template>
  <div class="max-w-md mx-auto mt-10">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">ログイン</h1>

    <form @submit.prevent="handleLogin" class="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
      <!-- Error Message -->
      <div v-if="errorMessage" class="p-3 bg-red-100 text-red-700 rounded-md">
        {{ errorMessage }}
      </div>

      <!-- Email Input -->
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">メールアドレス</label>
        <input v-model="email" type="email" id="email" required class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <!-- Password Input -->
      <div>
        <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">パスワード</label>
        <input v-model="password" type="password" id="password" required class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
      </div>

      <!-- Submit Button -->
      <button type="submit" :disabled="loading" class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400">
        {{ loading ? 'ログイン中...' : 'ログイン' }}
      </button>
    </form>

    <div class="mt-6">
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300 dark:border-gray-600"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white dark:bg-gray-900 text-gray-500">または</span>
        </div>
      </div>

      <div class="mt-6">
        <button @click="handleSocialLogin('github')" class="w-full flex items-center justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700">
          <!-- Simple placeholder for GitHub icon -->
          <span class="mr-2"> G </span>
          GitHubでサインイン
        </button>
      </div>
    </div>
     <div class="mt-4 text-center">
      <NuxtLink to="/signup" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        アカウントをお持ちでないですか？ 新規登録
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const router = useRouter();

const email = ref('');
const password = ref('');
const errorMessage = ref<string | null>(null);
const loading = ref(false);

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = null;
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });
    if (error) throw error;
    // Redirect is handled by the Supabase module, but as a fallback:
    router.push('/');
  } catch (error: any) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
};

const handleSocialLogin = async (provider: 'github') => {
  loading.value = true;
  errorMessage.value = null;
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${useRuntimeConfig().public.baseUrl}/confirm`
    }
  });
  if (error) {
    errorMessage.value = error.message;
    loading.value = false;
  }
};

// This page should not be accessible to logged-in users
const user = useSupabaseUser();
watch(user, (newUser) => {
  if (newUser) {
    router.push('/');
  }
}, { immediate: true });
</script>

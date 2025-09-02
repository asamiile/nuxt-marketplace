<template>
  <div class="max-w-md mx-auto mt-10">
    <h1 class="text-3xl font-bold mb-6 text-center text-gray-800 dark:text-gray-200">新規登録</h1>

    <div v-if="signupSuccess" class="p-4 bg-green-100 text-green-800 rounded-lg shadow-md">
      <h2 class="font-bold">登録ありがとうございます！</h2>
      <p>ご登録いただいたメールアドレスに確認メールを送信しました。メール内のリンクをクリックして登録を完了してください。</p>
    </div>

    <form v-else @submit.prevent="handleSignup" class="p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md space-y-6">
      <!-- Error Message -->
      <div v-if="errorMessage" class="p-3 bg-red-100 text-red-700 rounded-md">
        {{ errorMessage }}
      </div>

      <!-- Username Input -->
      <div>
        <label for="username" class="block text-sm font-medium text-gray-700 dark:text-gray-300">ユーザー名</label>
        <input v-model="username" type="text" id="username" required class="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
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
        {{ loading ? '登録中...' : '登録する' }}
      </button>
    </form>
    <div class="mt-4 text-center">
      <NuxtLink to="/login" class="text-sm text-blue-600 dark:text-blue-400 hover:underline">
        すでにアカウントをお持ちですか？ ログイン
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();
const router = useRouter();

const username = ref('');
const email = ref('');
const password = ref('');
const errorMessage = ref<string | null>(null);
const loading = ref(false);
const signupSuccess = ref(false);

const handleSignup = async () => {
  loading.value = true;
  errorMessage.value = null;
  try {
    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        // Pass user metadata to be used in the trigger
        data: {
          username: username.value
        },
        // This is where the user will be redirected after confirming their email
        emailRedirectTo: `${useRuntimeConfig().public.baseUrl}/confirm`
      }
    });
    if (error) throw error;
    signupSuccess.value = true;
  } catch (error: any) {
    errorMessage.value = error.message;
  } finally {
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

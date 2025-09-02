<template>
  <div class="min-h-screen bg-white dark:bg-gray-900">
    <header class="border-b border-gray-200 dark:border-gray-800">
      <nav class="container mx-auto p-4 flex justify-between items-center">
        <!-- Logo -->
        <NuxtLink to="/" class="font-bold text-xl text-blue-600 dark:text-blue-400">
          NicheAssets
        </NuxtLink>

        <!-- Navigation -->
        <div class="flex items-center space-x-4">
          <!-- Logged-in state -->
          <template v-if="user">
            <NuxtLink to="/products/create" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              出品する
            </NuxtLink>

            <!-- Profile Dropdown -->
            <div class="relative">
              <button @click="isProfileMenuOpen = !isProfileMenuOpen" class="flex items-center space-x-2">
                <img :src="profile?.avatar_url || 'https://via.placeholder.com/40'" alt="Avatar" class="w-10 h-10 rounded-full bg-gray-300">
                <span class="text-gray-700 dark:text-gray-300">{{ profile?.username || 'Profile' }}</span>
              </button>

              <!-- Dropdown Menu -->
              <div v-if="isProfileMenuOpen" class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-10">
                <NuxtLink to="/profile" @click="isProfileMenuOpen = false" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">プロフィール</NuxtLink>
                <a @click.prevent="() => { handleLogout(); isProfileMenuOpen = false; }" href="#" class="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">ログアウト</a>
              </div>
            </div>
          </template>

          <!-- Logged-out state -->
          <template v-else>
            <NuxtLink to="/login" class="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800">
              ログイン
            </NuxtLink>
            <NuxtLink to="/signup" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
              新規登録
            </NuxtLink>
          </template>
        </div>
      </nav>
    </header>

    <main class="container mx-auto p-4">
      <slot />
    </main>

    <footer class="border-t border-gray-200 dark:border-gray-800 mt-8">
      <div class="container mx-auto p-4 text-center text-sm text-gray-500">
        <div class="flex justify-center space-x-4">
          <NuxtLink to="/terms" class="hover:underline">利用規約</NuxtLink>
          <NuxtLink to="/privacy" class="hover:underline">プライバシーポリシー</NuxtLink>
        </div>
        <p class="mt-2">&copy; {{ new Date().getFullYear() }} NicheAssets. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const { user, profile } = useCurrentUser();
const supabase = useSupabaseClient();
const router = useRouter();

const isProfileMenuOpen = ref(false);

const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('Error logging out:', error.message);
  } else {
    // Redirect to home page after logout
    router.push('/');
  }
};

// Close dropdown when clicking outside
// Note: A custom directive would be more robust, but this is simple for now.
// A simple @click.away is not a standard Vue feature, so I will handle it differently.
// For simplicity, the menu will just close when an item is clicked.
// Re-enabling the click-away logic in a simpler way.
</script>

<style>
/* Basic styles for dark mode transition */
body {
  background-color: #fff;
  color: rgba(0,0,0,0.8);
}
.dark body {
  background-color: #091a28;
  color: #ebf4f1;
}
.sepia body {
  background-color: #f1e7d0;
  color: #433422;
}
</style>

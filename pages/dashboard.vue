<template>
  <div class="container py-8 relative">
    <!-- Global Alert -->
    <div v-if="alert.show" class="fixed top-20 right-1/2 translate-x-1/2 z-50 w-full max-w-sm">
      <Alert
        :title="alert.title"
        :description="alert.message"
        :class="alert.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'"
      />
    </div>

    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-foreground">マイダッシュボード</h1>
    </div>

    <Tabs default-value="listings" class="flex flex-col md:flex-row gap-8">
      <TabsList class="flex md:flex-col md:w-1/4 shrink-0">
        <TabsTrigger value="listings" class="w-full justify-start">
          あなたの出品商品
        </TabsTrigger>
        <TabsTrigger value="favorites" class="w-full justify-start">
          お気に入り商品
        </TabsTrigger>
        <TabsTrigger value="profile" class="w-full justify-start">
          プロフィール設定
        </TabsTrigger>
      </TabsList>

      <div class="flex-1">
        <!-- Profile Settings Content -->
        <TabsContent value="profile">
          <ProfileSettings @show-alert="handleShowAlert" />
        </TabsContent>

        <!-- Favorite Products Content -->
        <TabsContent value="favorites">
          <FavoriteProducts />
        </TabsContent>

        <!-- Your Products Content -->
        <TabsContent value="listings">
          <UserListings />
        </TabsContent>
      </div>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { buttonVariants } from '~/components/ui/buttonVariants'
import Tabs from '~/components/ui/tabs/Tabs.vue'
import TabsList from '~/components/ui/tabs/TabsList.vue'
import TabsTrigger from '~/components/ui/tabs/TabsTrigger.vue'
import TabsContent from '~/components/ui/tabs/TabsContent.vue'
import Alert from '~/components/ui/Alert.vue'
import ProfileSettings from '~/components/dashboard/ProfileSettings.vue'
import FavoriteProducts from '~/components/dashboard/FavoriteProducts.vue'
import UserListings from '~/components/dashboard/UserListings.vue'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useCurrentUser()

// --- Alert State & Logic ---
const alert = reactive({
  show: false,
  title: '',
  message: '',
  type: 'success' as 'success' | 'error',
})

function showAlert(title: string, message: string, type: 'success' | 'error' = 'success', duration = 5000) {
  alert.title = title
  alert.message = message
  alert.type = type
  alert.show = true

  setTimeout(() => {
    alert.show = false
  }, duration)
}

function handleShowAlert(alertData: { title: string, message: string, type: 'success' | 'error' }) {
  showAlert(alertData.title, alertData.message, alertData.type)
}



</script>

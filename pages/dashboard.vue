<template>
  <div class="container py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-foreground">マイダッシュボード</h1>
    </div>

    <Tabs default-value="listings" class="flex flex-col md:flex-row gap-8">
      <TabsList class="flex md:flex-col md:w-1/4 shrink-0">
        <TabsTrigger value="listings" class="w-full justify-start">
          出品した商品
        </TabsTrigger>
        <TabsTrigger value="sales" class="w-full justify-start">
          販売管理
        </TabsTrigger>
        <TabsTrigger value="profile" class="w-full justify-start">
          プロフィール設定
        </TabsTrigger>
      </TabsList>

      <div class="flex-1">
        <TabsContent value="listings">
          <UserListings />
        </TabsContent>
        <TabsContent value="sales">
          <SalesHistory />
        </TabsContent>
        <TabsContent value="profile">
          <ProfileSettings @show-alert="handleShowAlert" />
        </TabsContent>
      </div>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import Tabs from '~/components/ui/tabs/Tabs.vue'
import TabsList from '~/components/ui/tabs/TabsList.vue'
import TabsTrigger from '~/components/ui/tabs/TabsTrigger.vue'
import TabsContent from '~/components/ui/tabs/TabsContent.vue'
import ProfileSettings from '~/components/dashboard/ProfileSettings.vue'
import UserListings from '~/components/dashboard/UserListings.vue'
import SalesHistory from '~/components/dashboard/SalesHistory.vue'
import { useAlert } from '~/composables/useAlert'

definePageMeta({
  middleware: 'auth'
})

const { showToast } = useAlert()

function handleShowAlert(alertData: { title: string, message: string, type: 'success' | 'error' }) {
  showToast(alertData.title, alertData.message, alertData.type)
}
</script>

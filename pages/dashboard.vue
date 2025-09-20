<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-foreground">マイダッシュボード</h1>
    </div>

    <Tabs v-model="activeTab" class="flex flex-col lg:flex-row gap-8">
      <TabsList class="flex lg:flex-col justify-start lg:w-1/4 shrink-0">
        <TabsTrigger value="sales" class="lg:w-full justify-start">
          販売管理
        </TabsTrigger>
        <TabsTrigger value="listings" class="lg:w-full justify-start">
          出品管理
        </TabsTrigger>
        <TabsTrigger value="profile" class="lg:w-full justify-start">
          プロフィール設定
        </TabsTrigger>
      </TabsList>

      <div class="flex-1">
        <TabsContent value="sales">
          <SalesHistory />
        </TabsContent>
        <TabsContent value="listings">
          <UserListings />
        </TabsContent>
        <TabsContent value="profile">
          <ProfileSettings @show-alert="handleShowAlert" />
        </TabsContent>
      </div>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Tabs from '~/components/ui/tabs/Tabs.vue'
import TabsList from '~/components/ui/tabs/TabsList.vue'
import TabsTrigger from '~/components/ui/tabs/TabsTrigger.vue'
import TabsContent from '~/components/ui/tabs/TabsContent.vue'
import ProfileSettings from '~/components/dashboard/ProfileSettings'
import SalesHistory from '~/components/dashboard/SalesHistory'
import UserListings from '~/components/dashboard/UserListings'
import { useAlert } from '~/composables/useAlert'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const router = useRouter()

const activeTab = computed({
  get: () => (route.query.tab as string) || 'sales',
  set: (newValue) => {
    router.push({ query: { tab: newValue } })
  },
})

const { showToast } = useAlert()

function handleShowAlert(alertData: { title: string, description: string, variant: 'success' | 'error' }) {
  showToast(alertData)
}
</script>

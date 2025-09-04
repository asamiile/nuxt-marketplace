<template>
  <div class="container py-8">
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-foreground">マイダッシュボード</h1>
    </div>

    <Tabs default-value="profile" class="flex flex-col md:flex-row gap-8">
      <TabsList class="flex md:flex-col md:w-1/4 shrink-0">
        <TabsTrigger value="profile" class="w-full justify-start">
          プロフィール設定
        </TabsTrigger>
      </TabsList>

      <div class="flex-1">
        <!-- Profile Settings Content -->
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
import { useAlert } from '~/composables/useAlert'

definePageMeta({
  middleware: 'auth'
})

// --- Alert State & Logic ---
const { alert, showAlert } = useAlert()

function handleShowAlert(alertData: { title: string, message: string, type: 'success' | 'error' }) {
  showAlert(alertData.title, alertData.message, alertData.type)
}
</script>

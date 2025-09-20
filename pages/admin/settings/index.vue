<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">サイト設定</h1>

    <form @submit.prevent="handleSaveSettings">
      <div class="space-y-8">
        <!-- Basic Information -->
        <AdminCard title="サイト基本情報">
          <div class="grid grid-cols-1 gap-4">
            <div>
              <Label for="siteName">サイト名</Label>
              <Input id="siteName" v-model="settings.site_name" />
            </div>
            <div>
              <Label for="siteDescription">サイト概要</Label>
              <Textarea id="siteDescription" v-model="settings.site_description" rows="3" />
            </div>
          </div>
        </AdminCard>

      </div>

      <div class="mt-8 flex justify-end">
        <Button type="submit" :disabled="pending">
          {{ pending ? '保存中...' : '設定を保存' }}
        </Button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import AdminCard from '~/components/admin/AdminCard'
import Input from '~/components/ui/input/Input.vue'
import Textarea from '~/components/ui/textarea/Textarea.vue'
import Label from '~/components/ui/label/Label.vue'
import Button from '~/components/ui/button/Button.vue'
import { useAlert } from '~/composables/useAlert'
import { useSiteSettings } from '~/composables/useSiteSettings'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const { showToast } = useAlert()
const { refreshSettings } = useSiteSettings()
const pending = ref(false)

// Use a more flexible type for settings
const settings = ref<Record<string, any>>({
  site_name: '',
  site_description: '',
})

// Fetch initial settings
onMounted(async () => {
  pending.value = true
  try {
    const data = await $fetch('/api/admin/settings')
    // Ensure all keys exist, even if they are empty
    for (const key in settings.value) {
      if (data[key]) {
        settings.value[key] = data[key]
      }
    }
  } catch (error) {
    showToast({ title: 'エラー', description: '設定の読み込みに失敗しました。', variant: 'error' })
  } finally {
    pending.value = false
  }
})

const handleSaveSettings = async () => {
  pending.value = true
  try {
    const data = await $fetch('/api/admin/settings', {
      method: 'POST',
      body: settings.value,
    })

    // Refresh the global site settings
    await refreshSettings()

    // Update local state with the fresh data from the API response
    for (const key in settings.value) {
      if (data[key]) {
        settings.value[key] = data[key]
      }
    }

    showToast({ title: '成功', description: '設定を保存しました。' })
  } catch (error: any) {
    showToast({ title: 'エラー', description: error.data?.message || '設定の保存に失敗しました。', variant: 'error' })
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">サイト設定</h1>

    <form @submit.prevent="handleSaveSettings">
      <div class="space-y-8">
        <!-- Logo and Favicon Settings -->
        <Card>
          <CardHeader>
            <CardTitle>ロゴ・ファビコン</CardTitle>
            <CardDescription>サイトのロゴとファビコンを設定します。</CardDescription>
          </CardHeader>
          <CardContent class="space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label for="logo">ロゴ</Label>
                <FileDropzone id="logo" v-model:file="logoFile" accept="image/png, image/jpeg, image/svg+xml" />
                <img v-if="settings.logo_url && !logoFile" :src="settings.logo_url" alt="Logo preview" class="mt-4 max-h-20" />
              </div>
              <div>
                <Label for="favicon">ファビコン</Label>
                <FileDropzone id="favicon" v-model:file="faviconFile" accept="image/x-icon, image/png, image/svg+xml" />
                 <img v-if="settings.favicon_url && !faviconFile" :src="settings.favicon_url" alt="Favicon preview" class="mt-4 max-h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- Basic Information -->
        <Card>
          <CardHeader>
            <CardTitle>サイト基本情報</CardTitle>
            <CardDescription>サイト名や概要など、基本的な情報を設定します。</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <Label for="siteName">サイト名</Label>
              <Input id="siteName" v-model="settings.site_name" />
            </div>
            <div>
              <Label for="siteDescription">サイト概要</Label>
              <Textarea id="siteDescription" v-model="settings.site_description" rows="3" />
            </div>
          </CardContent>
        </Card>

        <!-- Terms and Privacy Policy -->
        <Card>
          <CardHeader>
            <CardTitle>利用規約・プライバシーポリシー</CardTitle>
            <CardDescription>サイトの利用規約とプライバシーポリシーを編集します。</CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <div>
              <Label for="terms">利用規約</Label>
              <Textarea id="terms" v-model="settings.terms_of_service" rows="10" />
            </div>
            <div>
              <Label for="privacy">プライバシーポリシー</Label>
              <Textarea id="privacy" v-model="settings.privacy_policy" rows="10" />
            </div>
          </CardContent>
        </Card>
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import Input from '~/components/ui/input/Input.vue'
import Textarea from '~/components/ui/textarea/Textarea.vue'
import Label from '~/components/ui/label/Label.vue'
import Button from '~/components/ui/button/Button.vue'
import FileDropzone from '~/components/ui/form/FileDropzone.vue'
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
  logo_url: '',
  favicon_url: '',
  site_name: '',
  site_description: '',
  terms_of_service: '',
  privacy_policy: '',
})

const logoFile = ref<File | null>(null)
const faviconFile = ref<File | null>(null)

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
    showToast('エラー', '設定の読み込みに失敗しました。', 'error')
  } finally {
    pending.value = false
  }
})

const handleSaveSettings = async () => {
  pending.value = true
  try {
    const formData = new FormData()

    // Append text settings
    for (const key in settings.value) {
      // Don't append URL values, they are derived from file uploads
      if (!key.endsWith('_url')) {
        formData.append(key, settings.value[key] || '')
      }
    }

    // Append file uploads
    if (logoFile.value) {
      formData.append('logo', logoFile.value)
    }
    if (faviconFile.value) {
      formData.append('favicon', faviconFile.value)
    }

    await $fetch('/api/admin/settings', {
      method: 'POST',
      body: formData,
    })

    // Refresh the global site settings
    await refreshSettings()

    // After successful upload, clear the file inputs and refetch the settings to show the new previews
    logoFile.value = null
    faviconFile.value = null

    const data = await $fetch('/api/admin/settings')
    for (const key in settings.value) {
      if (data[key]) {
        settings.value[key] = data[key]
      }
    }


    showToast('成功', '設定を保存しました。')
  } catch (error: any) {
    showToast('エラー', error.data?.message || '設定の保存に失敗しました。', 'error')
  } finally {
    pending.value = false
  }
}
</script>

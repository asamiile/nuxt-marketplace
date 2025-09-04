<template>
  <div class="mb-12">
    <h2 class="text-2xl font-semibold mb-4 text-foreground">プロフィール設定</h2>
    <div v-if="profilePending" class="text-center py-12 bg-secondary rounded-lg">
      <p>プロフィールを読み込み中...</p>
    </div>
    <form v-else-if="profile" @submit.prevent="updateProfile" class="space-y-6 bg-card p-8 rounded-lg shadow-md">
      <div>
        <Label for="username">ユーザー名</Label>
        <Input id="username" v-model="username" type="text" class="mt-1" />
      </div>
      <div>
        <Label for="avatar_url">アバターURL</Label>
        <Input id="avatar_url" v-model="avatar_url" type="text" class="mt-1" placeholder="https://..."/>
        <p class="text-sm text-muted-foreground mt-1">画像URLを入力してください。</p>
      </div>
      <div>
        <Label for="bio">自己紹介</Label>
        <Textarea id="bio" v-model="bio" class="mt-1" placeholder="こんにちは！..." />
      </div>
      <div>
        <Label for="website_url">ウェブサイトURL</Label>
        <Input id="website_url" v-model="website_url" type="url" class="mt-1" placeholder="https://..."/>
      </div>
      <div>
        <Label for="x_url">X (Twitter) URL</Label>
        <Input id="x_url" v-model="x_url" type="url" class="mt-1" placeholder="https://x.com/..."/>
      </div>
      <div>
        <Label for="youtube_url">YouTube URL</Label>
        <Input id="youtube_url" v-model="youtube_url" type="url" class="mt-1" placeholder="https://youtube.com/..."/>
      </div>
      <div class="pt-2">
        <Button type="submit" :disabled="saving" class="w-full">
          {{ saving ? '保存中...' : 'プロフィールを更新' }}
        </Button>
      </div>
    </form>
    <div v-else class="text-center py-12 bg-secondary rounded-lg">
      <p>プロフィールの読み込みに失敗しました。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import Input from '~/components/ui/Input.vue'
import Label from '~/components/ui/Label.vue'
import Textarea from '~/components/ui/Textarea.vue'
import Button from '~/components/ui/Button.vue'

const supabase = useSupabaseClient()
const user = useCurrentUser()

const emit = defineEmits(['show-alert'])

// --- Profile State & Logic ---
const saving = ref(false)

const { data: profile, pending: profilePending, refresh: refreshProfile } = useAsyncData('profile-data', async () => {
  if (!user.value) {
    return null
  }
  const { data, error } = await supabase
    .from('profiles')
    .select('username, avatar_url, bio, website_url, x_url, youtube_url')
    .eq('id', user.value.id)
    .single()

  if (error) {
    console.error('Error fetching profile data:', error.message)
    return null
  }
  return data
}, {
  watch: [user]
})

// Local state for form fields
const username = ref('')
const avatar_url = ref('')
const bio = ref('')
const website_url = ref('')
const x_url = ref('')
const youtube_url = ref('')

// Watch for profile data to load/change and update local state
watchEffect(() => {
  if (profile.value) {
    username.value = profile.value.username || ''
    avatar_url.value = profile.value.avatar_url || ''
    bio.value = profile.value.bio || ''
    website_url.value = profile.value.website_url || ''
    x_url.value = profile.value.x_url || ''
    youtube_url.value = profile.value.youtube_url || ''
  }
})

async function updateProfile() {
  if (!user.value) return
  saving.value = true
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        username: username.value,
        avatar_url: avatar_url.value,
        bio: bio.value,
        website_url: website_url.value,
        x_url: x_url.value,
        youtube_url: youtube_url.value,
      })
      .eq('id', user.value.id)
    if (error) throw error
    emit('show-alert', { title: '成功', message: 'プロフィールを更新しました！', type: 'success' })
    await refreshProfile() // Re-fetch data after successful update
  } catch (error: any) {
    emit('show-alert', { title: 'エラー', message: (error as Error).message, type: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

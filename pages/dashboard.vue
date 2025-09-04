<template>
  <div class="container py-8">
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
           <div class="mb-12">
            <h2 class="text-2xl font-semibold mb-4 text-foreground">プロフィール設定</h2>
            <div v-if="loading" class="text-center py-12 bg-secondary rounded-lg">
              <p>プロフィールを読み込み中...</p>
            </div>
            <form v-else @submit.prevent="updateProfile" class="space-y-6 bg-card p-8 rounded-lg shadow-md">
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
          </div>
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
import { ref, onMounted } from 'vue'
import Tabs from '~/components/ui/tabs/Tabs.vue'
import TabsList from '~/components/ui/tabs/TabsList.vue'
import TabsTrigger from '~/components/ui/tabs/TabsTrigger.vue'
import TabsContent from '~/components/ui/tabs/TabsContent.vue'
import FavoriteProducts from '~/components/dashboard/FavoriteProducts.vue'
import UserListings from '~/components/dashboard/UserListings.vue'
import Input from '~/components/ui/Input.vue'
import Label from '~/components/ui/Label.vue'
import Textarea from '~/components/ui/Textarea.vue'
import Button from '~/components/ui/Button.vue'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useCurrentUser()

// --- Profile State & Logic ---
const loading = ref(true)
const saving = ref(false)
const username = ref('')
const avatar_url = ref('')
const bio = ref('')
const website_url = ref('')
const x_url = ref('')
const youtube_url = ref('')

async function fetchProfile() {
  if (!user.value) return
  loading.value = true
  try {
    const { data, error, status } = await supabase
      .from('profiles')
      .select(`username, website_url, avatar_url, bio, x_url, youtube_url`)
      .eq('id', user.value.id)
      .single()

    if (error && status !== 406) throw error

    if (data) {
      username.value = data.username || ''
      website_url.value = data.website_url || ''
      avatar_url.value = data.avatar_url || ''
      bio.value = data.bio || ''
      x_url.value = data.x_url || ''
      youtube_url.value = data.youtube_url || ''
    }
  } catch (error) {
    alert('Error loading profile: ' + (error as Error).message)
  } finally {
    loading.value = false
  }
}

async function updateProfile() {
  if (!user.value) return
  saving.value = true
  try {
    const updates = {
      id: user.value.id,
      username: username.value,
      website_url: website_url.value,
      avatar_url: avatar_url.value,
      bio: bio.value,
      x_url: x_url.value,
      youtube_url: youtube_url.value,
    }

    const { error } = await supabase.from('profiles').upsert(updates)
    if (error) throw error
    alert('プロフィールが正常に更新されました！')
  } catch (error) {
    alert('Error updating profile: ' + (error as Error).message)
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

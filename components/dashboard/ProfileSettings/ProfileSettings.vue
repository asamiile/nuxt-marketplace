<template>
  <div>
    <div class="flex flex-col items-start sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
      <h2 class="text-2xl font-semibold text-foreground">プロフィール設定</h2>
      <NuxtLink v-if="username" :to="`/creator/${username}`" :class="buttonVariants({ variant: 'outline', class: 'hover:text-white hover:bg-gray-500' })">
        プロフィールを見る
      </NuxtLink>
    </div>
    <div v-if="loading" class="text-center py-12 bg-secondary rounded-lg">
      <p>プロフィールを読み込み中...</p>
    </div>
    <Card v-else>
      <CardContent class="p-4 md:p-8">
        <form @submit.prevent="updateProfile" class="space-y-6">
          <div>
            <Label for="username">ユーザー名</Label>
            <Input id="username" v-model="username" type="text" class="mt-1" placeholder="例: tanaka_taro" />
            <p v-if="errors.username" class="text-sm text-red-400 mt-1">{{ errors.username }}</p>
          </div>
          <div>
            <Label for="avatar_url">アバター画像</Label>
            <FileDropzone v-model="avatarFile" accept="image/*" :initial-preview-url="avatar_url" class="mt-1" />
            <p class="text-sm text-muted-foreground mt-2">新しい画像をドラッグ＆ドロップするか、クリックしてアバターを変更します。</p>
          </div>
          <div>
            <Label for="bio">自己紹介</Label>
            <Textarea id="bio" v-model="bio" class="mt-1" placeholder="こんにちは！..." />
          </div>
          <div>
            <Label for="website_url">ウェブサイトURL</Label>
            <Input id="website_url" v-model="website_url" type="url" class="mt-1" placeholder="https://..."/>
            <p v-if="errors.website_url" class="text-sm text-red-400 mt-1">{{ errors.website_url }}</p>
          </div>
          <div>
            <Label for="x_url">X (Twitter) URL</Label>
            <Input id="x_url" v-model="x_url" type="url" class="mt-1" placeholder="https://x.com/..."/>
            <p v-if="errors.x_url" class="text-sm text-red-400 mt-1">{{ errors.x_url }}</p>
          </div>
          <div>
            <Label for="youtube_url">YouTube URL</Label>
            <Input id="youtube_url" v-model="youtube_url" type="url" class="mt-1" placeholder="https://youtube.com/..."/>
            <p v-if="errors.youtube_url" class="text-sm text-red-400 mt-1">{{ errors.youtube_url }}</p>
          </div>
          <div class="pt-2">
            <Button type="submit" :disabled="saving || (hasAttemptedSubmit && isFormInvalid)" class="w-full hover:bg-primary/90">
              {{ saving ? '保存中...' : 'プロフィールを更新' }}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { z } from 'zod'
import { Card, CardContent } from '~/components/ui/card'
import { buttonVariants } from '~/components/ui/button'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import Textarea from '~/components/ui/textarea/Textarea.vue'
import Button from '~/components/ui/button/Button.vue'
import FileDropzone from '~/components/ui/form/FileDropzone.vue'

const supabase = useSupabaseClient()
const { user } = useCurrentUser()
const emit = defineEmits(['show-alert'])

// --- Profile State ---
const loading = ref(true)
const saving = ref(false)
const username = ref('')
const avatar_url = ref('')
const bio = ref('')
const website_url = ref('')
const avatarFile = ref<File | null>(null)
const x_url = ref('')
const youtube_url = ref('')
const hasAttemptedSubmit = ref(false)

// --- Validation ---
const errors = ref<Record<string, string>>({})

const profileSchema = z.object({
  username: z.string()
    .min(1, { message: "ユーザー名は必須です。" })
    .regex(/^[a-zA-Z0-9_]+$/, { message: "ユーザー名は英数字とアンダースコアのみ使用できます。" }),
  website_url: z.string().url({ message: "有効なURLを入力してください。" }).optional().or(z.literal('')),
  x_url: z.string().url({ message: "有効なURLを入力してください。" }).optional().or(z.literal('')),
  youtube_url: z.string().url({ message: "有効なURLを入力してください。" }).optional().or(z.literal('')),
})

const isFormInvalid = computed(() => {
  return !profileSchema.safeParse({
    username: username.value,
    website_url: website_url.value,
    x_url: x_url.value,
    youtube_url: youtube_url.value,
  }).success
})

const validate = () => {
  const result = profileSchema.safeParse({
    username: username.value,
    website_url: website_url.value,
    x_url: x_url.value,
    youtube_url: youtube_url.value,
  })

  if (!result.success) {
    const newErrors: Record<string, string> = {}
    for (const issue of result.error.issues) {
      newErrors[issue.path[0]] = issue.message
    }
    errors.value = newErrors
    return false
  }
  errors.value = {}
  return true
}

// Watch for changes to validate fields individually
watch(username, () => { if (hasAttemptedSubmit.value) validate() })
watch(website_url, () => { if (hasAttemptedSubmit.value) validate() })
watch(x_url, () => { if (hasAttemptedSubmit.value) validate() })
watch(youtube_url, () => { if (hasAttemptedSubmit.value) validate() })

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
  } catch (error: any) {
    emit('show-alert', { title: 'エラー', message: 'プロフィールの読み込みに失敗しました: ' + error.message, type: 'error' })
  } finally {
    loading.value = false
  }
}

async function updateProfile() {
  hasAttemptedSubmit.value = true
  if (!validate() || !user.value) {
    return
  }
  saving.value = true
  try {
    let publicUrl = avatar_url.value;

    if (avatarFile.value) {
      const filePath = `avatars/${user.value.id}`;
      const { error: uploadError } = await supabase.storage
        .from('assets')
        .upload(filePath, avatarFile.value, {
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('assets')
        .getPublicUrl(filePath);

      if (!data) {
        throw new Error('Failed to get public URL for avatar.');
      }
      publicUrl = data.publicUrl;
    }

    const updates = {
      id: user.value.id,
      username: username.value,
      website_url: website_url.value,
      avatar_url: publicUrl,
      bio: bio.value,
      x_url: x_url.value,
      youtube_url: youtube_url.value,
    };

    const { error } = await supabase.from('profiles').upsert(updates);
    if (error) throw error;

    // After a successful upload and profile update, refresh the avatar_url to be the new public one, not the blob url
    if(avatarFile.value) {
      const { data: profileData } = await supabase.from('profiles').select('avatar_url').eq('id', user.value.id).single();
      if(profileData) avatar_url.value = profileData.avatar_url;
    }

    avatarFile.value = null; // Reset file input
    emit('show-alert', { title: '成功', message: 'プロフィールが正常に更新されました！', type: 'success' });
    hasAttemptedSubmit.value = false;
  } catch (error: any) {
    // Check for username uniqueness error
    if (error.message.includes('duplicate key value violates unique constraint "profiles_username_key"')) {
       errors.value.username = 'このユーザー名は既に使用されています。';
       emit('show-alert', { title: 'エラー', message: 'このユーザー名は既に使用されています。', type: 'error' });
    } else {
      emit('show-alert', { title: 'エラー', message: 'プロフィールの更新に失敗しました: ' + error.message, type: 'error' });
    }
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  fetchProfile()
})
</script>

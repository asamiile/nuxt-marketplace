<template>
  <div class="flex items-center justify-center min-h-full py-12">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl font-bold text-center">
          ログイン
        </CardTitle>
        <CardDescription class="text-center">
          メールアドレスとパスワードを入力してください
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <form class="space-y-4" @submit.prevent="signInWithPassword">
          <div class="space-y-2">
            <label for="email-address">メールアドレス</label>
            <Input id="email-address" v-model="email" name="email" type="email" autocomplete="email" required placeholder="name@example.com" />
          </div>
          <div class="space-y-2">
            <label for="password">パスワード</label>
            <Input id="password" v-model="password" name="password" type="password" autocomplete="current-password" required placeholder="••••••••" />
          </div>
          <Button type="submit" class="w-full">
            ログイン
          </Button>
        </form>
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t" />
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-card text-muted-foreground">
              または
            </span>
          </div>
        </div>
        <Button variant="outline" class="w-full" @click="signInWithGoogle">
          Googleでログイン
        </Button>
        <div v-if="errorMsg" class="text-sm font-medium text-destructive">{{ errorMsg }}</div>
      </CardContent>
      <CardFooter class="flex justify-center">
        <p class="text-sm text-muted-foreground">
          アカウントをお持ちでないですか？
          <NuxtLink to="/signup" class="font-semibold text-primary hover:underline">
            新規登録
          </NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)

async function signInWithPassword() {
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    router.push('/')
  } catch (error: any) {
    errorMsg.value = error.message
  }
}

async function signInWithGoogle() {
  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) throw error
  } catch (error: any) {
    errorMsg.value = error.message
  }
}

const user = useCurrentUser()
watch(user, () => {
  if (user.value) {
    router.push('/')
  }
}, { immediate: true })
</script>

<template>
  <div class="flex items-center justify-center min-h-full py-12">
    <Card class="w-full max-w-md">
      <CardHeader>
        <CardTitle class="text-2xl font-bold text-center">
          アカウントを作成
        </CardTitle>
        <CardDescription class="text-center">
          新しいアカウントを作成します
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <form class="space-y-4" @submit.prevent="signUp">
          <div class="space-y-2">
            <label for="email-address">メールアドレス</label>
            <Input id="email-address" v-model="email" name="email" type="email" autocomplete="email" required placeholder="name@example.com" />
          </div>
          <div class="space-y-2">
            <label for="password">パスワード</label>
            <Input id="password" v-model="password" name="password" type="password" autocomplete="new-password" required placeholder="••••••••" />
          </div>
          <Button type="submit" class="w-full">
            アカウントを作成
          </Button>
        </form>
        <div v-if="errorMsg" class="text-sm font-medium text-destructive">{{ errorMsg }}</div>
        <div v-if="successMsg" class="text-sm font-medium text-green-600">{{ successMsg }}</div>
      </CardContent>
      <CardFooter class="flex justify-center">
        <p class="text-sm text-muted-foreground">
          すでにアカウントをお持ちですか？
          <NuxtLink to="/login" class="font-semibold text-primary hover:underline">
            ログイン
          </NuxtLink>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/Button'
import { Input } from '~/components/ui/Input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '~/components/ui/Card'

const supabase = useSupabaseClient()
const router = useRouter()

const email = ref('')
const password = ref('')
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

async function signUp() {
  try {
    errorMsg.value = null
    successMsg.value = null
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
    })
    if (error) throw error
    if (!data.user) throw new Error('User data is null after sign up.')

    successMsg.value = 'アカウントを確認するため、メールを確認してください。'
    // Don't redirect automatically, let the user see the message.
    // setTimeout(() => {
    //   router.push('/login')
    // }, 3000)
  } catch (error: any) {
    errorMsg.value = error.message
  }
}
</script>

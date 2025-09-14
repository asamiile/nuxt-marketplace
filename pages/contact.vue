<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-center mb-8 text-foreground">
      お問い合わせ
    </h1>
    <div class="text-card-foreground bg-card rounded-lg p-4 md:p-8 pt-8">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div>
            <Label for="name">お名前</Label>
            <Input id="name" v-model="form.name" name="name" type="text" class="mt-1" placeholder="山田 太郎" />
            <p v-if="errors.name" class="text-sm text-red-400 mt-1">{{ errors.name }}</p>
          </div>
          <div>
            <Label for="email">返信先メールアドレス</Label>
            <Input id="email" v-model="form.email" name="email" type="email" autocomplete="email" class="mt-1" placeholder="your-email@example.com" />
            <p v-if="errors.email" class="text-sm text-red-400 mt-1">{{ errors.email }}</p>
          </div>
          <div>
            <Label for="subject">件名</Label>
            <Input id="subject" v-model="form.subject" name="subject" type="text" class="mt-1" placeholder="件名を入力してください" />
            <p v-if="errors.subject" class="text-sm text-red-400 mt-1">{{ errors.subject }}</p>
          </div>
          <div>
            <Label for="message">お問い合わせ内容</Label>
            <Textarea id="message" v-model="form.message" name="message" :rows="4" class="mt-1" placeholder="お問い合わせ内容を入力してください" />
            <p v-if="errors.message" class="text-sm text-red-400 mt-1">{{ errors.message }}</p>
          </div>
          <div class="pt-2">
            <Button type="submit" :disabled="loading || (hasAttemptedSubmit && isFormInvalid)" class="w-full hover:bg-primary/90 transition-colors duration-200">
              <span v-if="loading">送信中...</span>
              <span v-else>送信</span>
            </Button>
          </div>
        </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import Textarea from '~/components/ui/textarea/Textarea.vue'
import Button from '~/components/ui/button/Button.vue'

const {
  form,
  loading,
  hasAttemptedSubmit,
  errors,
  isFormInvalid,
  handleSubmit,
} = useContactForm()
</script>

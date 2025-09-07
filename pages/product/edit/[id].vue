<template>
  <div>
    <div v-if="pending" class="text-center">
      <p>商品を読み込んでいます...</p>
    </div>
    <div v-else-if="!product" class="text-center">
      <h1 class="text-2xl font-bold">商品が見つからないか、編集権限がありません</h1>
      <NuxtLink to="/dashboard" :class="buttonVariants({ class: 'mt-6' })">
        ダッシュボードに戻る
      </NuxtLink>
    </div>
    <div v-else class="max-w-2xl mx-auto">
      <h1 class="text-3xl font-bold text-center mb-4 text-foreground">
        商品を編集する
      </h1>
      <p class="text-center mb-8">フォームの内容を更新して、商品情報を変更します。</p>
      <div class="text-card-foreground bg-card rounded-lg p-8 pt-8">
          <form @submit.prevent="submit" class="space-y-6">
            <div>
              <Label for="name">商品名</Label>
              <Input v-model="name" type="text" id="name" class="mt-1" />
               <p v-if="errors.name" class="text-sm text-red-500 mt-1">{{ errors.name }}</p>
            </div>
            <div>
              <Label for="description">説明</Label>
              <Textarea v-model="description" id="description" :rows="4" class="mt-1" />
              <p v-if="errors.description" class="text-sm text-red-500 mt-1">{{ errors.description }}</p>
            </div>
            <div>
              <Label for="price">価格 (円)</Label>
              <Input v-model.number="price" type="number" id="price" class="mt-1" />
               <p v-if="errors.price" class="text-sm text-red-500 mt-1">{{ errors.price }}</p>
            </div>
            <div>
              <Label for="category">カテゴリ</Label>
              <Select v-model="categoryId" id="category">
                <option :value="null" disabled>カテゴリを選択してください</option>
                <option v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </option>
              </Select>
              <p v-if="errors.categoryId" class="text-sm text-red-500 mt-1">{{ errors.categoryId }}</p>
            </div>
            <div>
              <Label for="tags">タグ (カンマ区切りまたはEnterで追加)</Label>
              <Input v-model="tagInput" @keydown.enter.prevent="addTag" @keydown.,.prevent="addTag" type="text" id="tags" class="mt-1" placeholder="例: イラスト, 3Dモデル" />
              <div class="mt-2 flex flex-wrap gap-2">
                <span v-for="tag in tags" :key="tag" class="inline-flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm font-medium rounded-full">
                  {{ tag }}
                  <button @click="removeTag(tag)" type="button" class="ml-1.5 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    <span class="sr-only">Remove tag</span>
                    <svg class="h-2 w-2" stroke="currentColor" fill="none" viewBox="0 0 8 8"><path stroke-linecap="round" stroke-width="1.5" d="M1 1l6 6m0-6L1 7" /></svg>
                  </button>
                </span>
              </div>
            </div>
            <div>
              <Label for="license_type">ライセンスの種類</Label>
              <Input v-model="license_type" id="license_type" class="mt-1" placeholder="例: スタンダードライセンス" />
            </div>
            <div>
              <Label for="terms_of_use">利用規約</Label>
              <Textarea v-model="terms_of_use" id="terms_of_use" :rows="3" class="mt-1" placeholder="商用利用可、改変可など" />
            </div>
            <div>
              <Label for="image">サムネイル画像 (変更する場合)</Label>
              <FileDropzone v-model="imageFile" accept="image/*" :initial-preview-url="product.image_url" class="mt-1" />
            </div>
            <div>
              <Label for="file">デジタルアセット (変更する場合)</Label>
              <FileDropzone v-model="assetFile" class="mt-1" />
              <p class="text-sm text-muted-foreground mt-2">現在のファイル: <a :href="product.file_url" target="_blank" class="underline hover:text-sky-500">ダウンロード</a></p>
            </div>
            <div class="pt-2">
              <Button type="submit" class="w-full hover:bg-gray-700 transition-colors duration-200" size="lg" :disabled="isSubmitting || (hasAttemptedSubmit && isFormInvalid)">
                {{ isSubmitting ? '更新中...' : '更新する' }}
              </Button>
            </div>
          </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ProductWithRelations } from '~/types/product'
import { buttonVariants } from '~/components/ui/button/buttonVariants'
import Input from '~/components/ui/form/Input.vue'
import Label from '~/components/ui/form/Label.vue'
import Textarea from '~/components/ui/form/Textarea.vue'
import Button from '~/components/ui/button/Button.vue'
import FileDropzone from '~/components/ui/form/FileDropzone.vue'
import Select from '~/components/ui/form/Select.vue'

definePageMeta({
  middleware: 'auth'
})

const supabase = useSupabaseClient()
const user = useCurrentUser()
const route = useRoute()
const id = route.params.id as string

// This ref will hold the product data fetched from the server.
const product = ref<ProductWithRelations | null>(null)
const pending = ref(true)

// Pass the ref to the composable. The composable will watch it.
const {
  name,
  description,
  price,
  categoryId,
  tags,
  tagInput,
  license_type,
  terms_of_use,
  imageFile,
  assetFile,
  isSubmitting,
  hasAttemptedSubmit,
  categories,
  errors,
  isFormInvalid,
  addTag,
  removeTag,
  submit
} = useProductForm('edit', product)

// Fetch the product data on mount and update the ref.
onMounted(async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*, tags(name)')
    .eq('id', id)
    .single()

  if (error || !data || data.creator_id !== user.value?.id) {
    product.value = null
  } else {
    product.value = data as ProductWithRelations
  }
  pending.value = false
})

</script>

<style scoped>
</style>
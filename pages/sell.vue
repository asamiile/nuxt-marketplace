<template>
  <div class="max-w-2xl mx-auto">
    <h1 class="text-3xl font-bold text-center mb-4 text-foreground">
      商品を出品する
    </h1>
    <p class="text-center mb-8 text-muted-foreground">
      以下のフォームに必要事項を入力して、新しい商品を販売してください。
    </p>
    <div class="text-card-foreground bg-secondary rounded-lg p-4 md:p-8 pt-8">
      <form @submit.prevent="submit" class="space-y-6">
        <div>
          <Label for="name">商品名</Label>
          <Input v-model="name" type="text" id="name" class="mt-1" placeholder="例: 高品質3Dキャラクターモデル" />
          <p v-if="errors.name" class="text-sm text-red-400 mt-1">{{ errors.name }}</p>
        </div>
        <div>
          <Label for="description">説明</Label>
          <Textarea v-model="description" id="description" :rows="4" class="mt-1" placeholder="商品の特徴、含まれるファイル、使い方などを詳しく説明します。" />
          <p v-if="errors.description" class="text-sm text-red-400 mt-1">{{ errors.description }}</p>
        </div>
        <div>
          <Label for="price">価格 (円)</Label>
          <Input v-model.number="price" type="number" id="price" class="mt-1" placeholder="例: 1500" />
          <p v-if="errors.price" class="text-sm text-red-400 mt-1">{{ errors.price }}</p>
        </div>

        <div>
          <Label for="category">カテゴリ</Label>
          <Select v-model="categoryId" id="category">
            <SelectTrigger>
              <SelectValue placeholder="カテゴリを選択してください" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem :value="null" disabled>カテゴリを選択してください</SelectItem>
              <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.categoryId" class="text-sm text-red-400 mt-1">{{ errors.categoryId }}</p>
        </div>

        <div>
          <Label for="tags">タグ (検索して選択)</Label>
          <Combobox>
            <ComboboxTrigger class="w-full">
              <Button
                variant="outline"
                role="combobox"
                class="w-full justify-between"
              >
                <span>タグを選択...</span>
                <ChevronsUpDown class="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </ComboboxTrigger>
            <ComboboxContent>
              <ComboboxInput placeholder="タグを検索..." />
              <ComboboxEmpty>見つかりませんでした。</ComboboxEmpty>
              <ComboboxGroup>
                <ComboboxItem
                  v-for="tag in publicTags"
                  :key="tag.id"
                  :value="tag.name"
                  @select.prevent="addTag(tag)"
                >
                  {{ tag.name }}
                </ComboboxItem>
              </ComboboxGroup>
            </ComboboxContent>
          </Combobox>
          <div class="mt-2 flex flex-wrap gap-2">
            <span v-for="tag in tags" :key="tag.id" class="inline-flex items-center px-2 py-1 bg-gray-200 dark:bg-gray-700 text-sm font-medium rounded-full">
              {{ tag.name }}
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
          <Label for="image">サムネイル画像</Label>
          <FileDropzone v-model="imageFile" accept="image/*" class="mt-1" />
          <p v-if="errors.image" class="text-sm text-red-400 mt-1">{{ errors.image }}</p>
        </div>
        <div>
          <Label for="file">デジタルアセット (zip, etc.)</Label>
          <FileDropzone v-model="assetFile" class="mt-1" />
          <p v-if="errors.file" class="text-sm text-red-400 mt-1">{{ errors.file }}</p>
        </div>
        <div class="pt-2">
          <Button type="submit" class="w-full" size="lg" :disabled="isSubmitting || (hasAttemptedSubmit && isFormInvalid)">
            {{ isSubmitting ? 'アップロード中...' : '出品する' }}
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
import FileDropzone from '~/components/ui/FileDropzone.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'
import { Combobox, ComboboxContent, ComboboxGroup, ComboboxInput, ComboboxItem, ComboboxTrigger, ComboboxEmpty } from '~/components/ui/combobox'
import { ChevronsUpDown } from 'lucide-vue-next'
import { ref } from 'vue'

definePageMeta({
  middleware: 'auth'
})

const {
  name,
  description,
  price,
  categoryId,
  tags,
  license_type,
  terms_of_use,
  imageFile,
  assetFile,
  isSubmitting,
  hasAttemptedSubmit,
  categories,
  publicTags,
  errors,
  isFormInvalid,
  addTag,
  removeTag,
  submit
} = useProductForm('create')

</script>

<style scoped>
</style>
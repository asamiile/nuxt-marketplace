<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Input from '~/components/ui/form/Input.vue'
import Label from '~/components/ui/form/Label.vue'
import Textarea from '~/components/ui/form/Textarea.vue'
import Button from '~/components/ui/button/Button.vue'
import Select from '~/components/ui/form/Select.vue'
import type { Product, Category } from '~/types/product'

definePageMeta({
  layout: 'admin',
  middleware: 'admin',
})

const route = useRoute()
const { showToast } = useAlert()
const productId = route.params.id as string

const form = ref<Partial<Product>>({
  name: '',
  description: '',
  price: 0,
  category_id: null,
})
const isSaving = ref(false)

// Fetch product data
const { data: product, pending: productPending, error: productError } = await useFetch<Product>(`/api/admin/products/${productId}`, {
  onResponse({ response }) {
    if (response.ok) {
      // Use structuredClone to avoid reactivity issues with the original data
      form.value = structuredClone(response._data)
    }
  },
  onResponseError: ({ response }) => {
    showToast({
      title: 'エラー',
      description: '商品データの取得に失敗しました。',
      variant: 'destructive',
    })
  }
})

// Fetch categories for the select dropdown
const { data: categories, pending: categoriesPending, error: categoriesError } = await useFetch<Category[]>('/api/admin/categories', {
  default: () => []
})

const handleSave = async () => {
  isSaving.value = true
  try {
    await $fetch(`/api/admin/products/${productId}`, {
      method: 'PUT',
      body: form.value,
    })
    showToast({
      title: '成功',
      description: '商品情報が正常に更新されました。',
    })
  } catch (err) {
    console.error('Failed to update product:', err)
    showToast({
      title: 'エラー',
      description: '商品情報の更新に失敗しました。',
      variant: 'destructive',
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div>
    <div v-if="productPending || categoriesPending">
      <p>読み込み中...</p>
    </div>
    <div v-else-if="productError || categoriesError">
      <p>データが見つかりません。</p>
    </div>
    <div v-else-if="product && categories">
      <h1 class="text-3xl font-bold mb-6">
        商品編集: {{ product.name }}
      </h1>

      <div class="text-card-foreground bg-card rounded-lg p-4 md:p-8">
        <form @submit.prevent="handleSave" class="space-y-6">
          <div>
            <Label for="name">商品名</Label>
            <Input v-model="form.name" type="text" id="name" class="mt-1" />
          </div>
          <div>
            <Label for="description">説明</Label>
            <Textarea v-model="form.description" id="description" :rows="4" class="mt-1" />
          </div>
          <div>
            <Label for="price">価格 (円)</Label>
            <Input v-model.number="form.price" type="number" id="price" class="mt-1" />
          </div>
          <div>
            <Label for="category">カテゴリ</Label>
            <Select v-model="form.category_id" id="category">
              <option :value="null">カテゴリなし</option>
              <option v-for="category in categories" :key="category.id" :value="category.id">
                {{ category.name }}
              </option>
            </Select>
          </div>
          <div class="pt-2">
            <Button type="submit" class="w-full" size="lg" :disabled="isSaving">
              {{ isSaving ? '保存中...' : '保存する' }}
            </Button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

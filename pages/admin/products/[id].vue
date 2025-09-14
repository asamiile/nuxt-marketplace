<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Input from '~/components/ui/input/Input.vue'
import Label from '~/components/ui/label/Label.vue'
import Textarea from '~/components/ui/textarea/Textarea.vue'
import Button from '~/components/ui/button/Button.vue'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select'
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
const { data: product, pending: productPending, error: productError } = await useFetch<Product>(`/api/admin/products/${productId}`)

// Watch for the product data to populate the form.
// This ensures server and client state are consistent.
watch(product, (newProduct) => {
  if (newProduct) {
    // Manually copy properties to avoid structuredClone error with non-cloneable proxy objects
    form.value = {
      id: newProduct.id,
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      category_id: newProduct.category_id,
      status: newProduct.status,
      admin_notes: newProduct.admin_notes,
    }
  }
}, { immediate: true })

if (productError.value) {
  showToast('エラー', '商品データの取得に失敗しました。', 'error')
}

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
    showToast('成功', '商品情報が正常に更新されました。')
    await navigateTo('/admin/products')
  } catch (err) {
    console.error('Failed to update product:', err)
    showToast('エラー', '商品情報の更新に失敗しました。', 'error')
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
              <SelectTrigger>
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem :value="null">カテゴリなし</SelectItem>
                <SelectItem v-for="category in categories" :key="category.id" :value="category.id">
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label for="status">承認ステータス</Label>
            <Select v-model="form.status" id="status">
              <SelectTrigger>
                <SelectValue placeholder="ステータスを選択" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">承認待ち</SelectItem>
                <SelectItem value="approved">承認済み</SelectItem>
                <SelectItem value="rejected">要修正</SelectItem>
                <SelectItem value="banned">却下</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label for="admin_notes">管理者メモ</Label>
            <Textarea v-model="form.admin_notes" id="admin_notes" :rows="4" class="mt-1" placeholder="非承認の理由などを入力" />
          </div>

          <div class="pt-2">
            <Button type="submit" class="w-full" size="lg" :disabled="isSaving">
              {{ isSaving ? '保存中...' : '保存する' }}
            </Button>
          </div>
        </form>
      </div>

      <div class="mt-6">
        <NuxtLink to="/admin/products" class="text-sm text-link hover:underline">
          &larr; 商品一覧に戻る
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

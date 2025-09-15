<template>
  <div>
    <h1 class="text-3xl font-bold mb-4">利用規約</h1>
    <div class="prose max-w-none" v-html="termsContent"></div>
  </div>
</template>

<script setup lang="ts">
import { useSiteSettings } from '~/composables/useSiteSettings'

const { getSetting } = useSiteSettings()
const termsContent = getSetting('terms_of_service', '利用規約が設定されていません。')
</script>

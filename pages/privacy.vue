<template>
  <div>
    <h1 class="text-3xl font-bold mb-4">プライバシーポリシー</h1>
    <div class="prose max-w-none" v-html="privacyContent"></div>
  </div>
</template>

<script setup lang="ts">
import { useSiteSettings } from '~/composables/useSiteSettings'

const { getSetting } = useSiteSettings()
const privacyContent = getSetting('privacy_policy', 'プライバシーポリシーが設定されていません。')
</script>

<template>
  <div class="fixed bottom-0 right-0 p-4 space-y-4 w-full max-w-sm">
    <transition-group name="toast-slide" tag="div">
      <Toast
        v-for="toast in toasts"
        :key="toast.id"
        :title="toast.title"
        :description="toast.message"
        :type="toast.type"
        @close="removeToast(toast.id)"
      />
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import Toast from './Toast.vue'
import { useAlert } from '~/composables/useAlert'

const { toasts, removeToast } = useAlert()
</script>

<style>
.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
.toast-slide-enter-from,
.toast-slide-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(30px);
}
.toast-slide-move {
  transition: transform 0.5s cubic-bezier(0.55, 0, 0.1, 1);
}
</style>

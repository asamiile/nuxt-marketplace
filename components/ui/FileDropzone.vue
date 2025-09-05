<script setup lang="ts">
import { ref, watch } from 'vue';
import { cn } from '@/lib/utils';

const props = defineProps<{
  modelValue?: File | null;
  accept?: string;
  initialPreviewUrl?: string | null;
}>();

const emit = defineEmits(['update:modelValue']);

const isDragging = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const previewUrl = ref<string | null>(props.initialPreviewUrl || null);

watch(() => props.initialPreviewUrl, (newUrl) => {
  previewUrl.value = newUrl || null;
});

watch(() => props.modelValue, (newFile) => {
  if (newFile) {
    const reader = new FileReader();
    reader.onload = (e) => {
      previewUrl.value = e.target?.result as string;
    };
    reader.readAsDataURL(newFile);
  } else if (!props.initialPreviewUrl) {
    previewUrl.value = null;
  }
});

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    emit('update:modelValue', file);
  }
};

const handleDragEnter = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = true;
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault(); // Necessary to allow drop
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  isDragging.value = false;
  const file = event.dataTransfer?.files[0];
  if (file) {
    emit('update:modelValue', file);
  }
};

const openFileDialog = () => {
  fileInput.value?.click();
};
</script>

<template>
  <div
    :class="cn(
      'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
      isDragging ? 'border-primary bg-muted' : 'border-border',
    )"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
    @click="openFileDialog"
  >
    <input
      ref="fileInput"
      type="file"
      class="hidden"
      :accept="accept"
      @change="handleFileChange"
    >
    <div v-if="previewUrl" class="flex flex-col items-center">
      <img :src="previewUrl" alt="File preview" class="max-h-48 max-w-full rounded-lg">
      <p class="mt-2 text-sm text-muted-foreground break-all">
        {{ modelValue?.name || '新しい画像を選択' }}
      </p>
    </div>
    <div v-else class="flex flex-col items-center justify-center space-y-2">
       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-10 w-10 text-muted-foreground"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" x2="12" y1="3" y2="15"></line></svg>
      <p class="text-sm text-muted-foreground">
        ファイルをここにドラッグ＆ドロップするか、クリックして選択
      </p>
    </div>
  </div>
</template>

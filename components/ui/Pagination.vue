<script setup lang="ts">
const props = defineProps({
  currentPage: {
    type: Number,
    required: true,
  },
  totalPages: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(['update:currentPage']);

const prevPage = () => {
  if (props.currentPage > 1) {
    emit('update:currentPage', props.currentPage - 1);
  }
};

const nextPage = () => {
  if (props.currentPage < props.totalPages) {
    emit('update:currentPage', props.currentPage + 1);
  }
};
</script>

<template>
  <div class="flex items-center justify-center space-x-4 text-sm">
    <Button
      variant="outline"
      size="sm"
      :disabled="currentPage === 1"
      @click="prevPage"
    >
      前へ
    </Button>
    <span>{{ currentPage }} / {{ totalPages }} ページ</span>
    <Button
      variant="outline"
      size="sm"
      :disabled="currentPage === totalPages"
      @click="nextPage"
    >
      次へ
    </Button>
  </div>
</template>

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import FileDropzone from './FileDropzone.vue'

const meta = {
  title: 'ui/form/FileDropzone',
  component: FileDropzone,
  tags: ['autodocs'],
  argTypes: {
    accept: { control: 'text' },
  },
} satisfies Meta<typeof FileDropzone>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { FileDropzone },
    setup() {
      const file = ref<File | null>(null)
      return { args, file }
    },
    template: `
      <div class="w-full max-w-sm mx-auto">
        <FileDropzone v-bind="args" v-model="file" />
        <div v-if="file" class="mt-4 text-sm">
          <p><strong>Selected File:</strong> {{ file.name }}</p>
          <p><strong>Size:</strong> {{ file.size }} bytes</p>
          <p><strong>Type:</strong> {{ file.type }}</p>
        </div>
      </div>
    `,
  }),
  args: {
    accept: 'image/*',
  },
}

export const WithInitialPreview: Story = {
  render: (args) => ({
    components: { FileDropzone },
    setup() {
      const file = ref<File | null>(null)
      return { args, file }
    },
    template: `
      <div class="w-full max-w-sm mx-auto">
        <FileDropzone v-bind="args" v-model="file" />
        <div v-if="file" class="mt-4 text-sm">
          <p><strong>Selected File:</strong> {{ file.name }}</p>
        </div>
         <div v-else class="mt-4 text-sm">
          <p>Initial preview is shown. Select a new file to change it.</p>
        </div>
      </div>
    `,
  }),
  args: {
    accept: 'image/*',
    initialPreviewUrl: 'https://via.placeholder.com/150',
  },
}

import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import { fn } from '@storybook/test'
import Combobox from './Combobox.vue'
import type { Tag } from '~/types/product'

const frameworks: Tag[] = [
  { id: 1, name: 'Vue.js', is_public: true, created_at: '' },
  { id: 2, name: 'React', is_public: true, created_at: '' },
  { id: 3, name: 'Angular', is_public: true, created_at: '' },
  { id: 4, name: 'Svelte', is_public: true, created_at: '' },
  { id: 5, name: 'Ember.js', is_public: true, created_at: '' },
]

const meta = {
  title: 'ui/form/Combobox',
  component: Combobox,
  tags: ['autodocs'],
  args: {
    items: frameworks,
    placeholder: 'Select a framework...',
    onSelect: fn(),
  },
} satisfies Meta<typeof Combobox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { Combobox },
    setup() {
      const selectedItem = ref<Tag | null>(null)
      const onSelect = (item: Tag) => {
        selectedItem.value = item
        args.onSelect(item)
      }
      return { args, selectedItem, onSelect }
    },
    template: `
      <div class="flex flex-col gap-4">
        <Combobox v-bind="args" @select="onSelect" />
        <div v-if="selectedItem" class="mt-4">
          Selected: {{ selectedItem.name }}
        </div>
      </div>
    `,
  }),
}

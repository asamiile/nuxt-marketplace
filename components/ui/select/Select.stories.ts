import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectItemText,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '.'

const meta = {
  title: 'ui/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: {
      Select,
      SelectContent,
      SelectGroup,
      SelectItem,
      SelectItemText,
      SelectLabel,
      SelectSeparator,
      SelectTrigger,
      SelectValue,
    },
    setup() {
      const value = ref('')
      return { args, value }
    },
    template: `
      <div class="w-full max-w-xs">
        <Select v-model="value">
          <SelectTrigger>
            <SelectValue placeholder="Select a fruit" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruits</SelectLabel>
              <SelectItem value="apple">
                <SelectItemText>Apple</SelectItemText>
              </SelectItem>
              <SelectItem value="banana">
                <SelectItemText>Banana</SelectItemText>
              </SelectItem>
              <SelectItem value="blueberry">
                <SelectItemText>Blueberry</SelectItemText>
              </SelectItem>
              <SelectItem value="grapes">
                <SelectItemText>Grapes</SelectItemText>
              </SelectItem>
              <SelectItem value="pineapple">
                <SelectItemText>Pineapple</SelectItemText>
              </SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="aubergine">
                <SelectItemText>Aubergine</SelectItemText>
              </SelectItem>
              <SelectItem value="broccoli">
                <SelectItemText>Broccoli</SelectItemText>
              </SelectItem>
              <SelectItem value="carrot" disabled>
                <SelectItemText>Carrot</SelectItemText>
              </SelectItem>
              <SelectItem value="courgette">
                <SelectItemText>Courgette</SelectItemText>
              </SelectItem>
              <SelectItem value="leek">
                <SelectItemText>Leek</SelectItemText>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <div class="mt-4 text-sm">
          Selected: {{ value }}
        </div>
      </div>
    `,
  }),
}

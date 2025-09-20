import type { Meta, StoryObj } from '@storybook/vue3'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '.'
import { Button } from '../button'
import { Label } from '../label'
import { Input } from '../input'

const meta = {
  title: 'ui/Popover',
  component: Popover,
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: {
      Popover,
      PopoverContent,
      PopoverTrigger,
      Button,
      Label,
      Input,
    },
    setup() {
      return { args }
    },
    template: `
      <Popover>
        <PopoverTrigger as-child>
          <Button variant="outline">Open popover</Button>
        </PopoverTrigger>
        <PopoverContent class="w-80">
          <div class="grid gap-4">
            <div class="space-y-2">
              <h4 class="font-medium leading-none">Dimensions</h4>
              <p class="text-sm text-muted-foreground">
                Set the dimensions for the layer.
              </p>
            </div>
            <div class="grid gap-2">
              <div class="grid grid-cols-3 items-center gap-4">
                <Label for="width">Width</Label>
                <Input
                  id="width"
                  defaultValue="100%"
                  class="col-span-2 h-8"
                />
              </div>
              <div class="grid grid-cols-3 items-center gap-4">
                <Label for="maxWidth">Max. width</Label>
                <Input
                  id="maxWidth"
                  defaultValue="300px"
                  class="col-span-2 h-8"
                />
              </div>
              <div class="grid grid-cols-3 items-center gap-4">
                <Label for="height">Height</Label>
                <Input
                  id="height"
                  defaultValue="25px"
                  class="col-span-2 h-8"
                />
              </div>
              <div class="grid grid-cols-3 items-center gap-4">
                <Label for="maxHeight">Max. height</Label>
                <Input
                  id="maxHeight"
                  defaultValue="none"
                  class="col-span-2 h-8"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    `,
  }),
}

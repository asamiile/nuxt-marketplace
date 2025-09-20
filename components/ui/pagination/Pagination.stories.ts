import type { Meta, StoryObj } from '@storybook/vue3'
import { ref } from 'vue'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationFirst,
  PaginationItem,
  PaginationLast,
  PaginationNext,
  PaginationPrevious,
} from '.'
import { Button } from '../button'

const meta = {
  title: 'ui/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  args: {
    total: 100,
    itemsPerPage: 10,
    siblingCount: 1,
    showEdges: true,
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: {
      Pagination,
      PaginationContent,
      PaginationEllipsis,
      PaginationFirst,
      PaginationItem,
      PaginationLast,
      PaginationNext,
      PaginationPrevious,
      Button,
    },
    setup() {
      const page = ref(1)
      return { args, page }
    },
    template: `
      <div>
        <Pagination
          v-slot="{ page: currentPage }"
          v-model:page="page"
          :total="args.total"
          :items-per-page="args.itemsPerPage"
          :sibling-count="args.siblingCount"
          :show-edges="args.showEdges"
        >
          <PaginationContent v-slot="{ items }" class="flex items-center gap-1">
            <PaginationFirst />
            <PaginationPrevious />

            <template v-for="(item, index) in items">
              <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
                <Button class="w-9 h-9 p-0" :variant="item.value === currentPage ? 'default' : 'outline'">
                  {{ item.value }}
                </Button>
              </PaginationItem>
              <PaginationEllipsis v-else :key="item.type" :index="index" />
            </template>

            <PaginationNext />
            <PaginationLast />
          </PaginationContent>
        </Pagination>
        <div class="mt-4 text-center text-sm">
          Page {{ page }}
        </div>
      </div>
    `,
  }),
}

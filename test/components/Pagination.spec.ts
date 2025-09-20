import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
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
} from '~/components/ui/pagination'
import { Button } from '~/components/ui/button'

describe('Pagination', () => {
  // A helper component to properly render the pagination with all its slots
  const PaginationWrapper = {
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
    props: ['total', 'itemsPerPage', 'siblingCount', 'showEdges'],
    template: `
      <Pagination
        :total="total"
        :items-per-page="itemsPerPage"
        :sibling-count="siblingCount"
        :show-edges="showEdges"
        @update:page="$emit('update:page', $event)"
      >
        <PaginationContent v-slot="{ items, page }">
          <PaginationFirst />
          <PaginationPrevious />
          <template v-for="(item, index) in items">
            <PaginationItem v-if="item.type === 'page'" :key="index" :value="item.value" as-child>
              <Button :variant="item.value === page ? 'default' : 'outline'">
                {{ item.value }}
              </Button>
            </PaginationItem>
            <PaginationEllipsis v-else :key="item.type" :index="index" />
          </template>
          <PaginationNext />
          <PaginationLast />
        </PaginationContent>
      </Pagination>
    `,
  }

  it('emits update:page event with the correct page number when next button is clicked', async () => {
    const wrapper = mount(PaginationWrapper, {
      props: {
        total: 100,
        itemsPerPage: 10,
        siblingCount: 1,
        showEdges: true,
      },
    })

    // find a button with "Next" text, or a specific data attribute
    const nextButton = wrapper.find('[data-slot="pagination-next"]')
    await nextButton.trigger('click')

    // Check if the event was emitted
    expect(wrapper.emitted('update:page')).toBeTruthy()

    // Check the payload of the event
    // The first emit's arguments are in emitted()['update:page'][0]
    expect(wrapper.emitted('update:page')?.[0]).toEqual([2])
  })

  it('emits update:page event when a specific page is clicked', async () => {
    const wrapper = mount(PaginationWrapper, {
      props: { total: 100, itemsPerPage: 10, page: 1 },
    })
    const pageButton = wrapper.findAll('button').find(b => b.text() === '3')
    await pageButton!.trigger('click')
    expect(wrapper.emitted('update:page')?.[0]).toEqual([3])
  })

  it('disables previous and first buttons on the first page', async () => {
    const wrapper = mount(PaginationWrapper, {
      props: { total: 100, itemsPerPage: 10, page: 1 },
    })
    const prevButton = wrapper.find('[data-slot="pagination-previous"]')
    const firstButton = wrapper.find('[data-slot="pagination-first"]')
    expect(prevButton.attributes('disabled')).toBeDefined()
    expect(firstButton.attributes('disabled')).toBeDefined()
  })

  it('disables next and last buttons on the last page', async () => {
    const wrapper = mount(PaginationWrapper, {
      props: { total: 100, itemsPerPage: 10, page: 10 },
    })
    const nextButton = wrapper.find('[data-slot="pagination-next"]')
    const lastButton = wrapper.find('[data-slot="pagination-last"]')
    expect(nextButton.attributes('disabled')).toBeDefined()
    expect(lastButton.attributes('disabled')).toBeDefined()
  })

  it('emits update:page event when previous button is clicked', async () => {
    const wrapper = mount(PaginationWrapper, {
      props: { total: 100, itemsPerPage: 10, page: 5 },
    })
    const prevButton = wrapper.find('[data-slot="pagination-previous"]')
    await prevButton.trigger('click')
    expect(wrapper.emitted('update:page')?.[0]).toEqual([4])
  })

  it('emits update:page event when first button is clicked', async () => {
    const wrapper = mount(PaginationWrapper, {
      props: { total: 100, itemsPerPage: 10, page: 5 },
    })
    const firstButton = wrapper.find('[data-slot="pagination-first"]')
    await firstButton.trigger('click')
    expect(wrapper.emitted('update:page')?.[0]).toEqual([1])
  })

  it('emits update:page event when last button is clicked', async () => {
    const wrapper = mount(PaginationWrapper, {
      props: { total: 100, itemsPerPage: 10, page: 5 },
    })
    const lastButton = wrapper.find('[data-slot="pagination-last"]')
    await lastButton.trigger('click')
    expect(wrapper.emitted('update:page')?.[0]).toEqual([10])
  })
})

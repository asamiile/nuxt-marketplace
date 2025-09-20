import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import ProductFilters from '@/components/ProductFilters/ProductFilters.vue'

// Mock child components that are complex or have their own dependencies
vi.mock('@/components/ui/select', async () => {
  return {
    Select: {
      template: '<div class="mock-select" @click="$emit(\'update:modelValue\', 1)"><slot/></div>',
      props: ['modelValue'],
      emits: ['update:modelValue'],
    },
    SelectTrigger: { template: '<div><slot/></div>' },
    SelectContent: { template: '<div><slot/></div>' },
    SelectItem: { template: '<div><slot/></div>' },
    SelectValue: { template: '<div><slot/></div>' },
    SelectGroup: { template: '<div><slot/></div>' },
    SelectLabel: { template: '<div><slot/></div>' },
  }
})

const mockCategories = [
  { id: 1, name: 'Electronics' },
  { id: 2, name: 'Books' },
]
const mockTags = [
  { id: 10, name: 'New' },
  { id: 11, name: 'Sale' },
]

describe('ProductFilters.vue', () => {
  const mountComponent = () => mount(ProductFilters, {
    props: {
      categories: mockCategories,
      tags: mockTags,
    },
  })

  it('emits updated filters when keyword is changed', async () => {
    const wrapper = await mountComponent()
    // Show filters
    await wrapper.find('button').trigger('click')

    const keywordInput = wrapper.find('#keyword-search')
    await keywordInput.setValue('test')

    // The component uses a watch with { deep: true }, so the emit should be triggered
    const updateEvents = wrapper.emitted('update:filters')
    expect(updateEvents).toHaveLength(1)
    expect(updateEvents![0][0]).toMatchObject({ keyword: 'test' })
  })

  it('emits updated filters when category is changed', async () => {
    const wrapper = await mountComponent()
    await wrapper.find('button').trigger('click')

    // The Select component is mocked to emit an update on click
    await wrapper.find('.mock-select').trigger('click')

    const updateEvents = wrapper.emitted('update:filters')
    expect(updateEvents).toHaveLength(1)
    expect(updateEvents![0][0]).toMatchObject({ categoryId: 1 })
  })

  it('emits updated filters when a tag is checked', async () => {
    const wrapper = await mountComponent()
    await wrapper.find('button').trigger('click')

    const tagCheckbox = wrapper.find('#tag-11')
    await tagCheckbox.setValue(true)

    const updateEvents = wrapper.emitted('update:filters')
    expect(updateEvents).toHaveLength(1)
    expect(updateEvents![0][0]).toMatchObject({ tagIds: [11] })
  })

  it('resets all filters when reset button is clicked', async () => {
    const wrapper = await mountComponent()
    await wrapper.find('button').trigger('click')

    // Change some filters first
    await wrapper.find('#keyword-search').setValue('test')
    await wrapper.find('#tag-10').setValue(true)

    // Find the reset button (it's the last button in the component)
    const resetButton = wrapper.findAll('button').find(b => b.text() === 'リセット')
    await resetButton!.trigger('click')

    const updateEvents = wrapper.emitted('update:filters')
    // The last event should be the reset one
    const lastEvent = updateEvents![updateEvents!.length - 1]
    expect(lastEvent[0]).toEqual({
      keyword: '',
      categoryId: null,
      tagIds: [],
      minPrice: null,
      maxPrice: null,
    })
  })
})

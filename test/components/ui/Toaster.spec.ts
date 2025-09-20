import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import Toaster from '@/components/ui/toast/Toaster.vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

// --- Mock useAlert ---
// Create the reactive state outside the hoist to avoid initialization errors
const toastsRef = ref<any[]>([])

const { showToastMock, removeToastMock, useAlertMock } = vi.hoisted(() => {
  const showToastMock = vi.fn((options: any) => {
    toastsRef.value.push({ id: Date.now(), ...options })
  })
  const removeToastMock = vi.fn((id: number) => {
    toastsRef.value = toastsRef.value.filter(t => t.id !== id)
  })
  const useAlertMock = () => ({
    toasts: toastsRef,
    showToast: showToastMock,
    removeToast: removeToastMock,
  })
  return { showToastMock, removeToastMock, useAlertMock }
})
mockNuxtImport('useAlert', () => useAlertMock)
// --- End Mock ---


describe('Toaster.vue', () => {
  beforeEach(() => {
    // Reset state and mocks before each test
    toastsRef.value = []
    vi.clearAllMocks()
  })

  it('displays a toast when showToast is called', async () => {
    const wrapper = mount(Toaster)
    expect(wrapper.text()).not.toContain('Success')

    // Call the mocked showToast function
    showToastMock({
      title: 'Success',
      message: 'Your action was successful.',
      type: 'success',
    })
    await nextTick()

    expect(wrapper.text()).toContain('Success')
    expect(wrapper.text()).toContain('Your action was successful.')
  })

  it('calls removeToast when the close button is clicked', async () => {
    const wrapper = mount(Toaster)
    const toastData = { id: 123, title: 'Error', message: 'Something went wrong', type: 'error' }

    // Manually set a toast to be in the list
    toastsRef.value = [toastData]
    await nextTick()

    // Find and click the close button
    const closeButton = wrapper.find('button[type="button"]')
    expect(closeButton.exists()).toBe(true)
    await closeButton.trigger('click')

    // Assert that our mocked removeToast function was called
    expect(removeToastMock).toHaveBeenCalledWith(toastData.id)
  })
})

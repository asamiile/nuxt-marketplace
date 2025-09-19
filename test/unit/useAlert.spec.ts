import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { useAlert } from '~/composables/useAlert'
import { nextTick } from 'vue'

// Since useAlert now manages its own state, we don't need to mock external libraries.
// We can directly test the composable's output.

describe('useAlert', () => {
  beforeEach(() => {
    // Vitest's fake timers allow us to control setTimeout
    vi.useFakeTimers()

    // Reset the state before each test.
    // This is a bit of a hack, but necessary since the state is global.
    // A better implementation might use a plugin system or provide a reset function.
    const { toasts, removeToast } = useAlert()
    toasts.value.forEach(toast => removeToast(toast.id))
  })

  afterEach(() => {
    // Restore real timers after each test
    vi.useRealTimers()
  })

  it('should add a success toast to the toasts array', async () => {
    const { showToast, toasts } = useAlert()
    const options = {
      title: 'Success',
      message: 'Your action was successful.',
      type: 'success' as const,
    }

    showToast(options)
    await nextTick()

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      title: options.title,
      message: options.message,
      type: options.type,
    })
  })

  it('should add an error toast to the toasts array', async () => {
    const { showToast, toasts } = useAlert()
    const options = {
      title: 'Error',
      message: 'Something went wrong.',
      type: 'error' as const,
    }

    showToast(options)
    await nextTick()

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0]).toMatchObject({
      title: options.title,
      message: options.message,
      type: options.type,
    })
  })

  it('should default to a success toast if type is not provided', async () => {
    const { showToast, toasts } = useAlert()
    const options = {
      title: 'Default',
      message: 'This is a default toast.',
    }

    showToast(options)
    await nextTick()

    expect(toasts.value).toHaveLength(1)
    expect(toasts.value[0].type).toBe('success')
  })

  it('should remove a toast when removeToast is called', async () => {
    const { showToast, removeToast, toasts } = useAlert()
    const options = {
      title: 'To Be Removed',
      message: 'This toast will be removed.',
    }

    showToast(options)
    await nextTick()

    const toastId = toasts.value[0].id
    removeToast(toastId)
    await nextTick()

    expect(toasts.value).toHaveLength(0)
  })

  it('should automatically remove a toast after the timeout', async () => {
    const { showToast, toasts } = useAlert()
    const options = {
      title: 'Auto Remove',
      message: 'This toast will disappear.',
    }

    showToast(options)
    await nextTick()

    expect(toasts.value).toHaveLength(1)

    // Fast-forward time by 5 seconds
    vi.advanceTimersByTime(5000)
    await nextTick()

    expect(toasts.value).toHaveLength(0)
  })
})

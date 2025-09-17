import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { useAlert } from '~/composables/useAlert'

describe('useAlert', () => {
  // Use fake timers to control setTimeout
  beforeEach(() => {
    vi.useFakeTimers()
    // Reset toasts array before each test to ensure isolation
    const { toasts, removeToast } = useAlert()
    // Create a mutable copy to iterate while removing
    const toastsToRemove = [...toasts]
    toastsToRemove.forEach(toast => removeToast(toast.id))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should show a success toast and add it to the toasts array', () => {
    const { toasts, showToast } = useAlert()

    expect(toasts.length).toBe(0)

    showToast('Success', 'Your action was successful.', 'success')

    expect(toasts.length).toBe(1)
    expect(toasts[0].title).toBe('Success')
    expect(toasts[0].message).toBe('Your action was successful.')
    expect(toasts[0].type).toBe('success')
  })

  it('should show an error toast', () => {
    const { toasts, showToast } = useAlert()

    showToast('Error', 'Something went wrong.', 'error')

    expect(toasts.length).toBe(1)
    expect(toasts[0].type).toBe('error')
  })

  it('should remove a toast when removeToast is called', () => {
    const { toasts, showToast, removeToast } = useAlert()

    showToast('Test', 'This is a test.')
    const toastId = toasts[0].id

    expect(toasts.length).toBe(1)

    removeToast(toastId)

    expect(toasts.length).toBe(0)
  })

  it('should automatically remove a toast after the specified duration', () => {
    const { toasts, showToast } = useAlert()
    const duration = 3000

    showToast('Auto Remove', 'This should disappear.', 'success', duration)

    expect(toasts.length).toBe(1)

    // Advance timers by the duration
    vi.advanceTimersByTime(duration)

    expect(toasts.length).toBe(0)
  })

  it('should not remove a toast if the wrong id is provided', () => {
    const { toasts, showToast, removeToast } = useAlert()

    showToast('Test', 'A toast.')
    expect(toasts.length).toBe(1)

    // Try to remove with a non-existent ID
    removeToast(99999)

    expect(toasts.length).toBe(1)
  })
})

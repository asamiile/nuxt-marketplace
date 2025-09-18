import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAlert } from '~/composables/useAlert'
import { toast } from 'vue-sonner'

// Mock vue-sonner
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('useAlert', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  it('should call toast.success with the correct parameters for a success toast', () => {
    const { showToast } = useAlert()
    const title = 'Success'
    const message = 'Your action was successful.'

    showToast(title, message, 'success')

    expect(toast.success).toHaveBeenCalledTimes(1)
    expect(toast.success).toHaveBeenCalledWith(title, {
      description: message,
    })
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('should call toast.error with the correct parameters for an error toast', () => {
    const { showToast } = useAlert()
    const title = 'Error'
    const message = 'Something went wrong.'

    showToast(title, message, 'error')

    expect(toast.error).toHaveBeenCalledTimes(1)
    expect(toast.error).toHaveBeenCalledWith(title, {
      description: message,
    })
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('should default to a success toast if type is not provided', () => {
    const { showToast } = useAlert()
    const title = 'Default'
    const message = 'This is a default toast.'

    showToast(title, message)

    expect(toast.success).toHaveBeenCalledTimes(1)
    expect(toast.success).toHaveBeenCalledWith(title, {
      description: message,
    })
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('should call console.warn for removeToast', () => {
    const { removeToast } = useAlert()
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    removeToast(123)

    expect(consoleWarnSpy).toHaveBeenCalledTimes(1)
    expect(consoleWarnSpy).toHaveBeenCalledWith('removeToast is deprecated. Toasts are now automatically removed.', 123)

    consoleWarnSpy.mockRestore()
  })
})

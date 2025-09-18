import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useAlert } from '~/composables/useAlert'
import { toast } from 'vue-sonner'

// Mock vue-sonner
vi.mock('vue-sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

describe('useAlert', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks()
  })

  it('should call toast.success with the correct parameters for a success toast', () => {
    const { showToast } = useAlert()
    const options = {
      title: 'Success',
      description: 'Your action was successful.',
      variant: 'success' as const,
    }

    showToast(options)

    expect(toast.success).toHaveBeenCalledTimes(1)
    expect(toast.success).toHaveBeenCalledWith(options.title, {
      description: options.description,
    })
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('should call toast.error with the correct parameters for an error toast', () => {
    const { showToast } = useAlert()
    const options = {
      title: 'Error',
      description: 'Something went wrong.',
      variant: 'error' as const,
    }

    showToast(options)

    expect(toast.error).toHaveBeenCalledTimes(1)
    expect(toast.error).toHaveBeenCalledWith(options.title, {
      description: options.description,
    })
    expect(toast.success).not.toHaveBeenCalled()
  })

  it('should default to a success toast if variant is not provided', () => {
    const { showToast } = useAlert()
    const options = {
      title: 'Default',
      description: 'This is a default toast.',
    }

    showToast(options)

    expect(toast.success).toHaveBeenCalledTimes(1)
    expect(toast.success).toHaveBeenCalledWith(options.title, {
      description: options.description,
    })
    expect(toast.error).not.toHaveBeenCalled()
  })

  it('should call toast.info for an info toast', () => {
    const { showToast } = useAlert()
    const options = {
      title: 'Info',
      description: 'This is some information.',
      variant: 'info' as const,
    }

    showToast(options)

    expect(toast.info).toHaveBeenCalledTimes(1)
    expect(toast.info).toHaveBeenCalledWith(options.title, {
      description: options.description,
    })
  })

  it('should call toast.warning for a warning toast', () => {
    const { showToast } = useAlert()
    const options = {
      title: 'Warning',
      description: 'This is a warning.',
      variant: 'warning' as const,
    }

    showToast(options)

    expect(toast.warning).toHaveBeenCalledTimes(1)
    expect(toast.warning).toHaveBeenCalledWith(options.title, {
      description: options.description,
    })
  })
})

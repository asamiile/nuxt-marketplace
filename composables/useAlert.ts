import { toast } from 'vue-sonner'

export function useAlert() {
  const showToast = (title: string, message: string, type: 'success' | 'error' = 'success') => {
    if (type === 'success') {
      toast.success(title, {
        description: message,
      })
    }
    else {
      toast.error(title, {
        description: message,
      })
    }
  }

  // We are not using the removeToast function anymore,
  // as sonner handles this automatically.
  // We will keep the function signature for now to avoid breaking changes.
  const removeToast = (id: number) => {
    // eslint-disable-next-line no-console
    console.warn('removeToast is deprecated. Toasts are now automatically removed.', id)
  }

  return {
    // We are not using the toasts array anymore,
    // as sonner handles this automatically.
    toasts: [],
    showToast,
    removeToast,
  }
}

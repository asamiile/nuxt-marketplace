import { ref, readonly } from 'vue'

interface Toast {
  id: number
  title: string
  message: string
  type: 'success' | 'error'
}

const toasts = ref<Toast[]>([])

export function useAlert() {
  const showToast = (options: {
    title: string,
    message: string,
    type?: 'success' | 'error'
  }) => {
    const id = Date.now()
    toasts.value.push({
      id,
      title: options.title,
      message: options.message,
      type: options.type || 'success',
    })

    setTimeout(() => {
      removeToast(id)
    }, 5000)
  }

  const removeToast = (id: number) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
  }

  return {
    toasts: readonly(toasts),
    showToast,
    removeToast,
  }
}

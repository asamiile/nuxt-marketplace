import { reactive, readonly } from 'vue'

interface Toast {
  id: number
  title: string
  message: string
  type: 'success' | 'error'
}

// Define the state outside the composable function to make it a singleton
const toasts = reactive<Toast[]>([])

export function useAlert() {
  function showToast(title: string, message: string, type: 'success' | 'error' = 'success', duration = 5000) {
    const id = Date.now()
    toasts.push({
      id,
      title,
      message,
      type,
    })

    setTimeout(() => {
      removeToast(id)
    }, duration)
  }

  function removeToast(id: number) {
    const index = toasts.findIndex(toast => toast.id === id)
    if (index !== -1) {
      toasts.splice(index, 1)
    }
  }

  return {
    toasts: readonly(toasts),
    showToast,
    removeToast,
  }
}

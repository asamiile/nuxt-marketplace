// composables/useAlert.ts
import { toast } from 'vue-sonner'

export function useAlert() {
  const showToast = (options: {
    title: string,
    description?: string,
    variant?: 'success' | 'error' | 'info' | 'warning'
  }) => {
    const toastFunctions = {
      success: toast.success,
      error: toast.error,
      info: toast.info,
      warning: toast.warning,
    };

    const toastFn = toastFunctions[options.variant || 'success'] || toast;
    toastFn(options.title, {
      description: options.description,
    });
  }

  return { showToast }
}

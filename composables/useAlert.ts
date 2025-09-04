import { reactive } from 'vue'

// Define the state outside the composable function to make it a singleton
const alertState = reactive({
  show: false,
  title: '',
  message: '',
  type: 'success' as 'success' | 'error',
})

export function useAlert() {
  function showAlert(title: string, message: string, type: 'success' | 'error' = 'success', duration = 5000) {
    alertState.title = title
    alertState.message = message
    alertState.type = type
    alertState.show = true

    setTimeout(() => {
      alertState.show = false
    }, duration)
  }

  return {
    alert: alertState,
    showAlert,
  }
}

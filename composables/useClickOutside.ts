import { onMounted, onUnmounted, type Ref } from 'vue'

export function useClickOutside(
  el: Ref<HTMLElement | undefined>,
  callback: (e: MouseEvent) => void
) {
  const listener = (e: MouseEvent) => {
    if (!el.value || el.value.contains(e.target as Node)) {
      return
    }
    callback(e)
  }

  onMounted(() => {
    document.addEventListener('click', listener)
  })

  onUnmounted(() => {
    document.removeEventListener('click', listener)
  })
}

import { onMounted, onUnmounted } from 'vue'

export const useColorMode = () => {
  const setColorTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const mediaQueryListener = (e: MediaQueryListEvent) => {
    setColorTheme(e.matches)
  }

  onMounted(() => {
    if (process.client) {
      const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      setColorTheme(darkModeMediaQuery.matches)
      darkModeMediaQuery.addEventListener('change', mediaQueryListener)

      onUnmounted(() => {
        darkModeMediaQuery.removeEventListener('change', mediaQueryListener)
      })
    }
  })
}

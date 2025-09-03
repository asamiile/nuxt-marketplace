export default defineNuxtPlugin(() => {
  const setColorTheme = (isDark: boolean) => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  // Set the theme on initial load
  setColorTheme(darkModeMediaQuery.matches)

  // Listen for changes
  darkModeMediaQuery.addEventListener('change', (e) => {
    setColorTheme(e.matches)
  })
})

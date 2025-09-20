import { ref, computed } from 'vue'

type SiteSettings = Record<string, any>;

const siteSettings = ref<SiteSettings | null>(null)

export const useSiteSettings = () => {
  const fetchSettings = async () => {
    if (siteSettings.value === null) {
      try {
        // This endpoint should be public and not require admin auth.
        // Let's assume we will create /api/settings.get.ts for this.
        const data = await $fetch('/api/settings')
        siteSettings.value = data
      } catch (error) {
        console.error('Failed to fetch site settings:', error)
        // Set to an empty object to prevent repeated failed fetches
        siteSettings.value = {}
      }
    }
    return siteSettings
  }

  const getSetting = (key: string, defaultValue: string = '') => {
    return computed(() => siteSettings.value?.[key] || defaultValue)
  }

  // A function to force a refresh from the server
  const refreshSettings = async () => {
    siteSettings.value = null
    await fetchSettings()
  }

  return {
    settings: siteSettings,
    fetchSettings,
    refreshSettings,
    getSetting,
  }
}

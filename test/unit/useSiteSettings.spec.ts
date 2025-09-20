import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useSiteSettings } from '~/composables/useSiteSettings'
import { nextTick } from 'vue'

// Mock the global $fetch
const $fetch = vi.fn()
global.$fetch = $fetch

describe('useSiteSettings', () => {
  // Before each test, reset the mocks and the internal state of the composable
  beforeEach(async () => {
    vi.clearAllMocks()
    // This is a bit of a hack to reset the singleton state within the composable
    const { refreshSettings, settings } = useSiteSettings()
    // Set settings to null to ensure fetch is called
    settings.value = null
  })

  it('initial state is null', () => {
    const { settings } = useSiteSettings()
    expect(settings.value).toBeNull()
  })

  // Further tests will go here
  describe('fetchSettings', () => {
    it('should call $fetch and populate settings on first call', async () => {
      const mockSettings = { title: 'Test Site' }
      $fetch.mockResolvedValue(mockSettings)

      const { fetchSettings, settings } = useSiteSettings()
      await fetchSettings()

      expect($fetch).toHaveBeenCalledWith('/api/settings')
      expect($fetch).toHaveBeenCalledTimes(1)
      expect(settings.value).toEqual(mockSettings)
    })

    it('should not call $fetch on subsequent calls', async () => {
      const mockSettings = { title: 'Test Site' }
      $fetch.mockResolvedValue(mockSettings)

      const { fetchSettings } = useSiteSettings()
      await fetchSettings() // First call
      await fetchSettings() // Second call

      expect($fetch).toHaveBeenCalledTimes(1)
    })

    it('should handle fetch errors gracefully', async () => {
      const error = new Error('API Error')
      $fetch.mockRejectedValue(error)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { fetchSettings, settings } = useSiteSettings()
      await fetchSettings()

      expect($fetch).toHaveBeenCalledTimes(1)
      expect(settings.value).toEqual({})
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch site settings:', error)

      consoleErrorSpy.mockRestore()
    })
  })

  describe('getSetting', () => {
    it('should return a computed property with the setting value', async () => {
      const { fetchSettings, getSetting } = useSiteSettings()
      $fetch.mockResolvedValue({ title: 'My Awesome Site' })
      await fetchSettings()

      const siteTitle = getSetting('title')
      expect(siteTitle.value).toBe('My Awesome Site')
    })

    it('should return the default value if setting does not exist', async () => {
      const { fetchSettings, getSetting } = useSiteSettings()
      $fetch.mockResolvedValue({})
      await fetchSettings()

      const siteDescription = getSetting('description', 'A default description.')
      expect(siteDescription.value).toBe('A default description.')
    })

    it('should return an empty string if setting does not exist and no default is provided', async () => {
      const { fetchSettings, getSetting } = useSiteSettings()
      $fetch.mockResolvedValue({})
      await fetchSettings()

      const siteLogo = getSetting('logo')
      expect(siteLogo.value).toBe('')
    })

    it('should be reactive and update when settings change', async () => {
        const { fetchSettings, getSetting, settings } = useSiteSettings()
        $fetch.mockResolvedValue({ theme: 'dark' })
        await fetchSettings()

        const theme = getSetting('theme')
        expect(theme.value).toBe('dark')

        // Manually update the settings ref to simulate a change
        settings.value = { theme: 'light' }
        await nextTick()

        expect(theme.value).toBe('light')
    })
  })

  describe('refreshSettings', () => {
    it('should force a new call to $fetch', async () => {
      $fetch.mockResolvedValue({ theme: 'dark' })
      const { fetchSettings, refreshSettings } = useSiteSettings()

      await fetchSettings()
      expect($fetch).toHaveBeenCalledTimes(1)

      $fetch.mockResolvedValue({ theme: 'light' })
      await refreshSettings()

      expect($fetch).toHaveBeenCalledTimes(2)
    })
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProductFavorite } from '~/composables/useProductFavorite'
import { ref, nextTick } from 'vue'
import type { User } from '@supabase/supabase-js'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

// --- Mocks ---
const { useCurrentUserMock } = vi.hoisted(() => ({
  useCurrentUserMock: vi.fn()
}))
mockNuxtImport('useCurrentUser', () => useCurrentUserMock)

const useFavoritesMock = {
  isFavorited: vi.fn(),
  addFavorite: vi.fn(),
  removeFavorite: vi.fn(),
}
const { useFavoritesNuxMock } = vi.hoisted(() => ({
  useFavoritesNuxMock: vi.fn(() => useFavoritesMock)
}))
mockNuxtImport('useFavorites', () => useFavoritesNuxMock)

// Mock useAsyncData
const { useAsyncDataMock } = vi.hoisted(() => ({
  useAsyncDataMock: vi.fn((key, handler, options) => {
    const defaultValue = options?.default ? options.default() : undefined;
    const data = ref(defaultValue);

    const promise = (async () => {
      const result = await handler();
      if (result !== undefined) {
          data.value = result;
      }
    })(); // Immediately invoke the async function

    return { data, promise };
  }),
}));
mockNuxtImport('useAsyncData', () => useAsyncDataMock)
// --- End Mocks ---

// --- Test Data ---
const mockUser: User = {
  id: 'user-123',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}
// --- End Test Data ---

describe('useProductFavorite', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCurrentUserMock.mockReturnValue({ user: ref(null) })
    useFavoritesMock.isFavorited.mockResolvedValue(false)
    useFavoritesMock.addFavorite.mockResolvedValue(undefined)
    useFavoritesMock.removeFavorite.mockResolvedValue(undefined)
  })

  // Tests will go here
  describe('Initial State', () => {
    it('should not call isFavorited and default to false if user is not logged in', () => {
      useCurrentUserMock.mockReturnValue({ user: ref(null) })
      const { isFavoritedState } = useProductFavorite(1)
      expect(useFavoritesMock.isFavorited).not.toHaveBeenCalled()
      expect(isFavoritedState.value).toBe(false)
    })

    it('should not call isFavorited and default to false if productId is undefined', () => {
      useCurrentUserMock.mockReturnValue({ user: ref(mockUser) })
      const { isFavoritedState } = useProductFavorite(ref(undefined))
      expect(useFavoritesMock.isFavorited).not.toHaveBeenCalled()
      expect(isFavoritedState.value).toBe(false)
    })

    it('should call isFavorited and set state when user and productId are present', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(mockUser) })
      useFavoritesMock.isFavorited.mockResolvedValue(true)

      const { isFavoritedState, promise } = useProductFavorite(1)

      await promise
      await nextTick()

      expect(useFavoritesMock.isFavorited).toHaveBeenCalledWith(1)
      expect(isFavoritedState.value).toBe(true)
    })
  })

  describe('toggleFavorite', () => {
    beforeEach(() => {
      global.alert = vi.fn()
    })

    it('should alert the user and do nothing if not logged in', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(null) })
      const { toggleFavorite, promise } = useProductFavorite(1)
      await promise
      await nextTick()

      await toggleFavorite()

      expect(global.alert).toHaveBeenCalledWith('Please log in to favorite items.')
      expect(useFavoritesMock.addFavorite).not.toHaveBeenCalled()
    })

    it('should call addFavorite and optimistically update state to true', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(mockUser) })
      useFavoritesMock.isFavorited.mockResolvedValue(false) // Initial state is not favorited
      const { toggleFavorite, isFavoritedState, promise } = useProductFavorite(1)
      await promise
      await nextTick()

      expect(isFavoritedState.value).toBe(false) // Verify initial state

      await toggleFavorite()

      expect(isFavoritedState.value).toBe(true)
      expect(useFavoritesMock.addFavorite).toHaveBeenCalledWith(1)
    })

    it('should call removeFavorite and optimistically update state to false', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(mockUser) })
      useFavoritesMock.isFavorited.mockResolvedValue(true) // Initial state is favorited
      const { toggleFavorite, isFavoritedState, promise } = useProductFavorite(1)
      await promise
      await nextTick()

      expect(isFavoritedState.value).toBe(true) // Verify initial state

      await toggleFavorite()

      expect(isFavoritedState.value).toBe(false)
      expect(useFavoritesMock.removeFavorite).toHaveBeenCalledWith(1)
    })

    it('should revert state if addFavorite fails', async () => {
      useCurrentUserMock.mockReturnValue({ user: ref(mockUser) })
      useFavoritesMock.isFavorited.mockResolvedValue(false)
      const error = new Error('Failed to add')
      useFavoritesMock.addFavorite.mockRejectedValue(error)
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const { toggleFavorite, isFavoritedState, promise } = useProductFavorite(1)
      await promise
      await nextTick()

      expect(isFavoritedState.value).toBe(false)

      await toggleFavorite()

      expect(isFavoritedState.value).toBe(false) // Should revert to false
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to toggle favorite:', error)
      consoleErrorSpy.mockRestore()
    })
  })
})

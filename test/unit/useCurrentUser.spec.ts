import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { ref } from 'vue'
import type { User } from '@supabase/supabase-js'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

// Hoist the mock factory to the top level
const { useSupabaseUserMock } = vi.hoisted(() => ({
  useSupabaseUserMock: vi.fn()
}))

// Mock the 'useSupabaseUser' auto-import to use our mock factory
mockNuxtImport('useSupabaseUser', () => {
  return useSupabaseUserMock
})

describe('useCurrentUser', () => {
  // Reset the mock's implementation and call history before each test
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('isAdmin should be false when user is not logged in', () => {
    useSupabaseUserMock.mockReturnValue(ref(null))
    const { isAdmin } = useCurrentUser()
    expect(isAdmin.value).toBe(false)
  })

  it('isAdmin should be false when user has no app_metadata', () => {
    const mockUser: User = {
      id: '123',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }
    useSupabaseUserMock.mockReturnValue(ref(mockUser))
    const { isAdmin } = useCurrentUser()
    expect(isAdmin.value).toBe(false)
  })

  it('isAdmin should be false when app_metadata has no claims_admin property', () => {
    const mockUser: any = {
      id: '123',
      app_metadata: { provider: 'google' },
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }
    useSupabaseUserMock.mockReturnValue(ref(mockUser))
    const { isAdmin } = useCurrentUser()
    expect(isAdmin.value).toBe(false)
  })

  it('isAdmin should be false when claims_admin is not explicitly true', () => {
    const mockUser: any = {
      id: '123',
      app_metadata: { claims_admin: false },
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }
    useSupabaseUserMock.mockReturnValue(ref(mockUser))
    const { isAdmin } = useCurrentUser()
    expect(isAdmin.value).toBe(false)
  })

  it('isAdmin should be true when claims_admin is true', () => {
    const mockUser: any = {
      id: '123',
      app_metadata: { claims_admin: true },
      user_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    }
    useSupabaseUserMock.mockReturnValue(ref(mockUser))
    const { isAdmin } = useCurrentUser()
    expect(isAdmin.value).toBe(true)
  })

  it('should return the user ref itself', () => {
    const mockUser: any = { id: '123', email: 'test@example.com' }
    useSupabaseUserMock.mockReturnValue(ref(mockUser))
    const { user } = useCurrentUser()
    expect(user.value).toEqual(mockUser)
  })
})

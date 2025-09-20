import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import TheHeader from '@/components/TheHeader/TheHeader.vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { User } from '@supabase/supabase-js'

// --- Mock Composables & Components ---

// useSiteSettings
const { useSiteSettingsMock } = vi.hoisted(() => ({
  useSiteSettingsMock: () => ({
    getSetting: (key: string, defaultValue: any) => ref(defaultValue),
  }),
}))
mockNuxtImport('useSiteSettings', () => useSiteSettingsMock)

// useCurrentUser
const userRef = ref<User | null>(null)
const { useCurrentUserMock } = vi.hoisted(() => ({
  useCurrentUserMock: () => ({
    user: userRef,
    isAdmin: ref(false),
  }),
}))
mockNuxtImport('useCurrentUser', () => useCurrentUserMock)

// useSupabaseClient
const signOutMock = vi.fn(() => ({ error: null }))
const fromMock = vi.fn().mockReturnThis()
const selectMock = vi.fn().mockReturnThis()
const eqMock = vi.fn().mockReturnThis()
const singleMock = vi.fn()
const supabaseMock = {
  auth: { signOut: signOutMock },
  from: fromMock,
  select: selectMock,
  eq: eqMock,
  single: singleMock,
}
const { useSupabaseClientMock } = vi.hoisted(() => ({
  useSupabaseClientMock: () => supabaseMock,
}))
mockNuxtImport('useSupabaseClient', () => useSupabaseClientMock)

// useRouter
const pushMock = vi.fn()
const { useRouterMock } = vi.hoisted(() => ({
  useRouterMock: () => ({
    push: pushMock,
  }),
}))
mockNuxtImport('useRouter', () => useRouterMock)

// useSupabaseHelpers
const { getOptimizedPublicUrlMock, useSupabaseHelpersMock } = vi.hoisted(() => ({
    getOptimizedPublicUrlMock: vi.fn((path) => `http://example.com/optimized/${path}`),
    useSupabaseHelpersMock: () => ({
        getPathFromUrl: (url: string) => {
            if (!url || !url.includes('/assets/')) return null
            return url.split('/assets/')[1]
        },
        getOptimizedPublicUrl: getOptimizedPublicUrlMock
    })
}))
mockNuxtImport('useSupabaseHelpers', () => useSupabaseHelpersMock)

// --- End Mocks ---

const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {},
  user_metadata: {},
  aud: 'authenticated',
  created_at: new Date().toISOString(),
}

const mockProfile = {
  username: 'testuser',
  avatar_url: 'http://example.com/some/path/assets/user-avatars/avatar1.png',
}

describe('TheHeader.vue', () => {
    const mountOptions = {
        global: {
            stubs: {
                NuxtLink: {
                    template: '<a :href="to"><slot /></a>',
                    props: ['to']
                }
            }
        }
    }

  beforeEach(() => {
    vi.clearAllMocks()
    userRef.value = null
    singleMock.mockResolvedValue({ data: null, error: null })
  })

  describe('when user is logged out', () => {
    it('shows login and sign-up buttons', () => {
      const wrapper = mount(TheHeader, mountOptions)
      const text = wrapper.text()
      expect(text).toContain('ログイン')
      expect(text).toContain('新規登録')
      // Check for absence of user menu button
      expect(wrapper.find('button.flex.items-center').exists()).toBe(false)
    })
  })

  describe('when user is logged in', () => {
    beforeEach(() => {
        userRef.value = mockUser
        singleMock.mockResolvedValue({ data: mockProfile, error: null })
    })

    it('shows the user avatar when profile is loaded', async () => {
        const wrapper = mount(TheHeader, mountOptions)
        // Wait for async operations in watchEffect to complete
        await new Promise(resolve => setTimeout(resolve, 0));
        await nextTick()

        const avatarImage = wrapper.find('button.flex.items-center img')
        expect(avatarImage.exists()).toBe(true)
        expect(avatarImage.attributes('src')).toBe('http://example.com/optimized/user-avatars/avatar1.png')
    })

    it('opens the user menu on click and shows user info', async () => {
        const wrapper = mount(TheHeader, mountOptions)
        await nextTick()

        const button = wrapper.find('button.flex.items-center')
        await button.trigger('click')

        const menu = wrapper.find('[class*="absolute right-0"]')
        expect(menu.exists()).toBe(true)
        const menuText = menu.text()
        expect(menuText).toContain('testuser')
        expect(menuText).toContain('test@example.com')
        expect(menuText).toContain('ダッシュボード')
        expect(menuText).toContain('ログアウト')
    })

    it('calls signOut and navigates to login on logout button click', async () => {
        const wrapper = mount(TheHeader, mountOptions)
        await nextTick()

        // Open menu
        await wrapper.find('button.flex.items-center').trigger('click')

        // Click logout
        const logoutButton = wrapper.find('button.text-destructive')
        await logoutButton.trigger('click')

        expect(signOutMock).toHaveBeenCalledTimes(1)

        // Wait for async signOut to complete
        await nextTick()
        await nextTick()

        expect(pushMock).toHaveBeenCalledWith('/login')
    })
  })
})

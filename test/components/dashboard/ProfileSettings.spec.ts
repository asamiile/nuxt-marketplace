import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import ProfileSettings from '@/components/dashboard/ProfileSettings/ProfileSettings.vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import type { User } from '@supabase/supabase-js'

// --- Mock Composables & Components ---

// useCurrentUser
const userRef = ref<User | null>(null)
const { useCurrentUserMock } = vi.hoisted(() => ({
  useCurrentUserMock: () => ({ user: userRef }),
}))
mockNuxtImport('useCurrentUser', () => useCurrentUserMock)

// useSupabaseClient
const fromMock = vi.fn().mockReturnThis()
const selectMock = vi.fn().mockReturnThis()
const eqMock = vi.fn().mockReturnThis()
const singleMock = vi.fn()
const uploadMock = vi.fn()
const getPublicUrlMock = vi.fn()
const upsertMock = vi.fn()

const supabaseMock = {
  from: fromMock,
  select: selectMock,
  eq: eqMock,
  single: singleMock,
  upsert: upsertMock,
  storage: {
    from: vi.fn(() => ({
      upload: uploadMock,
      getPublicUrl: getPublicUrlMock,
    })),
  },
}
const { useSupabaseClientMock } = vi.hoisted(() => ({
  useSupabaseClientMock: () => supabaseMock,
}))
mockNuxtImport('useSupabaseClient', () => useSupabaseClientMock)

// --- End Mocks ---

const mockUser: User = {
  id: 'user-123',
  email: 'test@example.com',
  app_metadata: {}, user_metadata: {}, aud: 'authenticated', created_at: ''
}
const mockProfile = {
  username: 'testuser',
  website_url: 'https://example.com',
  avatar_url: 'http://example.com/avatar.png',
  bio: 'This is a test bio.',
  x_url: 'https://x.com/testuser',
  youtube_url: 'https://youtube.com/testuser',
}

describe('ProfileSettings.vue', () => {
  const mountComponent = () => {
    return mount(ProfileSettings, {
      global: {
        stubs: {
          NuxtLink: { template: '<a><slot/></a>' },
          // Stub all child components to isolate the ProfileSettings logic
          Card: { template: '<div><slot /></div>' },
          CardContent: { template: '<div><slot /></div>' },
          Input: { template: '<input @input="$emit(\'update:modelValue\', $event.target.value)" :value="modelValue" :id="id" />', props: ['modelValue', 'id'] },
          Label: { template: '<label><slot /></label>' },
          Textarea: { template: '<textarea @input="$emit(\'update:modelValue\', $event.target.value)" :id="id"></textarea>', props: ['modelValue', 'id'] },
          Button: { template: '<button><slot /></button>' },
          FileDropzone: { template: '<div class="file-dropzone"></div>', props: ['modelValue', 'initialPreviewUrl'] },
        }
      }
    })
  }

  beforeEach(() => {
    vi.clearAllMocks()
    userRef.value = mockUser
    singleMock.mockResolvedValue({ data: mockProfile, error: null, status: 200 })
    upsertMock.mockResolvedValue({ error: null })
    uploadMock.mockResolvedValue({ error: null })
    getPublicUrlMock.mockReturnValue({ data: { publicUrl: 'http://example.com/new-avatar.png' } })
  })

  it('loads the user profile and populates the form on mount', async () => {
    const wrapper = mountComponent()
    expect(supabaseMock.from).toHaveBeenCalledWith('profiles')
    await nextTick()
    await nextTick()

    // We can't easily check the v-model on the stub, but we can check if the initial data is used in the update call
    await wrapper.find('form').trigger('submit')
    expect(upsertMock).toHaveBeenCalledWith(expect.objectContaining({
      username: 'testuser',
      bio: 'This is a test bio.'
    }))
  })

  it('emits an error alert if fetching the profile fails', async () => {
    const error = new Error('Fetch failed')
    singleMock.mockResolvedValue({ data: null, error, status: 500 })
    const wrapper = mountComponent()
    await nextTick()
    await nextTick()
    expect(wrapper.emitted('show-alert')).toHaveLength(1)
  })

  it('shows a validation error for invalid username', async () => {
    const wrapper = mountComponent()
    await nextTick()
    await nextTick()

    await wrapper.find('#username').setValue('')
    await wrapper.find('form').trigger('submit')
    await nextTick()

    expect(wrapper.text()).toContain('ユーザー名は英数字とアンダースコアのみ使用できます。')
    expect(upsertMock).not.toHaveBeenCalled()
  })

  it('calls upsert with the correct payload on successful submission', async () => {
    const wrapper = mountComponent()
    await nextTick()
    await nextTick()

    await wrapper.find('#bio').setValue('A new bio')
    await wrapper.find('form').trigger('submit')

    expect(upsertMock).toHaveBeenCalledWith(expect.objectContaining({
        bio: 'A new bio',
    }))
    expect(wrapper.emitted('show-alert')).toHaveLength(1)
  })

  it('uploads a new avatar and updates the profile with the new URL', async () => {
    const wrapper = mountComponent()
    await nextTick()
    await nextTick()

    const mockFile = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    // Simulate file drop by emitting event from the stubbed component
    await wrapper.findComponent('.file-dropzone').vm.$emit('update:modelValue', mockFile)

    await wrapper.find('form').trigger('submit')

    expect(uploadMock).toHaveBeenCalledWith('avatars/user-123', mockFile, { upsert: true })
    expect(upsertMock).toHaveBeenCalledWith(expect.objectContaining({
        avatar_url: 'http://example.com/new-avatar.png'
    }))
  })
})

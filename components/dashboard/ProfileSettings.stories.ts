import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import ProfileSettings from './ProfileSettings.vue';
import { fn } from '@storybook/test';

const meta = {
  title: 'components/dashboard/ProfileSettings',
  component: ProfileSettings,
  tags: ['autodocs'],
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/react/configure/story-layout
    layout: 'fullscreen',
  },
  argTypes: {
    'onShow-alert': { action: 'showAlert' },
  },
} satisfies Meta<typeof ProfileSettings>;

export default meta;
type Story = StoryObj<typeof meta>;

const mockUser = {
  id: '12345',
  email: 'test@example.com',
};

const mockProfile = {
  username: 'testuser',
  avatar_url: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  bio: 'This is a test bio.',
  website_url: 'https://example.com',
  x_url: 'https://x.com/example',
  youtube_url: 'https://youtube.com/example',
};

export const Default: Story = {
  args: {},
  parameters: {
    useSupabaseUser: () => ref(mockUser),
    useSiteSettings: () => ({
      getSetting: (key: string, defaultValue: any) => defaultValue,
    }),
    useSupabaseClient: () => ({
      from: () => ({
        select: () => ({
          eq: () => ({
            single: () => ({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
        upsert: () => ({
            error: null,
        }),
      }),
      storage: {
        from: () => ({
          upload: () => ({ error: null }),
          getPublicUrl: () => ({ data: { publicUrl: 'https://example.com/new-avatar.png' } }),
        }),
      },
    }),
  },
};

export const Loading: Story = {
  args: {},
  parameters: {
    useSupabaseUser: () => ref(mockUser),
    useSiteSettings: () => ({
        getSetting: (key: string, defaultValue: any) => defaultValue,
    }),
    useSupabaseClient: () => ({
        from: () => ({
            select: () => ({
                eq: () => ({
                    single: () => new Promise(resolve => setTimeout(() => resolve({ data: mockProfile, error: null }), 2000)),
                }),
            }),
        }),
    }),
  },
};

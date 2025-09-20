import type { Preview } from "@storybook/vue3";
import { setup } from "@storybook/vue3";
import { ref } from 'vue'
import '~/assets/css/tailwind.css'
import { fn } from '@storybook/test';

setup((app) => {
  app.provide('useState', (name, fn) => ref(fn()));
  app.provide('useSupabaseUser', ref(null))
  app.provide('useRouter', () => ({
    push: fn(),
  }))
});


const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
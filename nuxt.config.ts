// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/supabase',
    'shadcn-nuxt',
    '@nuxt/test-utils/module',
    '@nuxtjs/storybook',
  ],
  css: ['~/assets/css/tailwind.css'],
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui'
  },
  supabase: {
    url: process.env.NUXT_PUBLIC_SUPABASE_URL,
    key: process.env.NUXT_PUBLIC_SUPABASE_KEY,
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/', // Redirect to home after login
      exclude: [
        '/',
        '/signup',
        '/forgot-password',
        '/update-password',
        '/terms',
        '/privacy',
        '/product/*',
        '/creator/*',
      ],
    },
  },
  devServer: {
    https: {
      key: './server.key',
      cert: './server.crt'
    }
  },
  runtimeConfig: {
    // The private keys which are only available on server-side
    supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY,
    // Public keys that are exposed to the client
    public: {
      // publicなキーがあればここに記述
    }
  },
})
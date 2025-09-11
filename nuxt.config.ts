// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase'
  ],
  css: ['~/assets/css/main.css'],
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
})

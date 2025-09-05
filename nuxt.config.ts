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
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: true,
    redirectOptions: {
      login: '/login',
      callback: '/', // Redirect to home after login
      exclude: ['/signup', '/forgot-password', '/update-password'], // Exclude signup page from auth guard
    },
  },
  // devServer: {
  //   https: {
  //     key: './server.key',
  //     cert: './server.crt'
  //   }
  // },
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@nuxtjs/i18n'
  ],
  i18n: {
    strategy: 'prefix_except_default',
    locales: [
      { code: 'ja', iso: 'ja-JP', name: '日本語' },
      { code: 'en', iso: 'en-US', name: 'English' },      
    ],
    lazy: true,
    defaultLocale: 'ja',
    vueI18n: './i18n.config.ts',
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_KEY,
    redirect: false
  }
})

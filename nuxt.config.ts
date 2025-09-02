// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@nuxtjs/color-mode',
  ],

  supabase: {
    // Options
    redirectOptions: {
      login: '/login',
      callback: '/confirm',
      exclude: [
        '/', // Allow access to the homepage
        '/login',
        '/signup',
      ], // Pages that don't require authentication
    }
  },

  colorMode: {
    classSuffix: '' // Enables class-based dark mode (e.g., <html class="dark">)
  },

  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL || 'http://localhost:3000',
    }
  }
})

// REMINDER: Create a .env file in the root directory with your Supabase credentials:
// SUPABASE_URL="your-supabase-url"
// SUPABASE_KEY="your-supabase-anon-key"

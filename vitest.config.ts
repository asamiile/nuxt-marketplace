import { defineVitestConfig } from '@nuxt/test-utils/config'

export default defineVitestConfig({
  test: {
    // Set the test environment to 'nuxt'.
    // This will provide a Nuxt runtime environment for all tests,
    // which is necessary for testing composables and components.
    environment: 'nuxt',

    // You can optionally set Nuxt-specific environment options
    environmentOptions: {
      nuxt: {
        // Use 'happy-dom' for a simulated DOM environment.
        // This is useful for testing composables that might interact with the DOM.
        domEnvironment: 'happy-dom',
      },
    },
    // Enable global test APIs (describe, test, expect, vi)
    // to be available in all test files without importing them.
    globals: true,
  },
})
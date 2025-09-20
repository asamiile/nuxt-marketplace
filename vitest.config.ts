import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/{e2e,unit}/*.{test,spec}.ts'],
          environment: 'happy-dom', // Changed from node to happy-dom for composables
        },
        resolve: {
          alias: {
            '~': fileURLToPath(new URL('./', import.meta.url)),
            '#imports': fileURLToPath(new URL('./.nuxt/imports.d.ts', import.meta.url)),
          },
        },
      },
      defineVitestProject({ // Removed await as it's not needed
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
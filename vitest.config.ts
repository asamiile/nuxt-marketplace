import { defineConfig } from 'vitest/config'
import { defineVitestProject } from '@nuxt/test-utils/config'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  test: {
    projects: [
      defineVitestProject({
        test: {
          name: 'unit',
          include: ['test/{e2e,unit}/*.{test,spec}.ts'],
          environment: 'node',
        },
        // Add alias resolution for the unit test project
        resolve: {
          alias: {
            '~': fileURLToPath(new URL('./', import.meta.url)),
          }
        }
      }),
      defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})

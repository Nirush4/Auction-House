// vitest.config.js
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',
    include: ['**/*.test.{ts,js}'], // include all .test.ts and .test.js
    exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
  },
})

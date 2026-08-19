import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    typecheck: {
      enabled: true,
      include: ['src/**/*.test-d.ts'],
      tsconfig: './tsconfig.json',
    },
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      include: ['src/**'],
      exclude: ['src/**/*.test-d.ts', 'src/index.ts'],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
})

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    // MCP サーバは DOM を持たない。jsdom を敷くと「実行時に何が使えるか」を誤魔化すことになる
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      include: ['src/**'],
      exclude: ['src/index.ts'],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
})

import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    // MCP サーバは DOM を持たない。jsdom を敷くと「実行時に何が使えるか」を誤魔化すことになる
    environment: 'node',
    include: ['src/**/*.test.ts'],
    coverage: {
      include: ['src/**'],
      // 再輸出だけのエントリと、標準入出力に繋ぐだけの実行ファイル。
      // どちらも判断を持たない。動くことは stdio での実接続で確かめる
      exclude: ['src/index.ts', 'src/bin.ts'],
      thresholds: { lines: 90, functions: 90, branches: 90, statements: 90 },
    },
  },
})

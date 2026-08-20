import { defineConfig } from 'tsdown'

export default defineConfig({
  // 実行ファイルとライブラリを分ける。import しただけで標準入出力を掴まないため
  entry: ['src/index.ts', 'src/bin.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  // データは JS に埋め込む。実行時にファイルを読まないため、
  // MCP サーバがファイルシステムに一切触れない状態を保てる（ADR-A3）。
  deps: {
    neverBundle: ['@modelcontextprotocol/sdk', 'zod'],
  },
})

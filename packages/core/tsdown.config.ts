import { defineConfig } from 'tsdown'

export default defineConfig({
  // メインエントリは型・契約・語彙のみで、React ランタイムを一切 import しない。
  // クライアント専用のもの（フック・Toast プリミティブ）は 'use client' が必要なため
  // 別エントリに分ける。混ぜるとパッケージ全体がクライアント専用になる（ADR-C6）。
  entry: ['src/index.ts', 'src/client/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  deps: {
    neverBundle: ['react', 'react-aria-components'],
  },
})

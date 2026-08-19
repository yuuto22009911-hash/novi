import { defineConfig } from 'tsdown'

export default defineConfig({
  // メインエントリは型・契約・語彙のみで、React ランタイムを一切 import しない。
  // フックは 'use client' が必要なため別エントリに分ける（RSC で壊れないようにするため）。
  entry: ['src/index.ts', 'src/hooks/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  deps: {
    neverBundle: ['react', 'react-aria-components'],
  },
})

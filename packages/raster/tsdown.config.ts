import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  unbundle: true,
  dts: true,
  clean: true,
  treeshake: true,
  deps: {
    neverBundle: ['react', 'react-aria-components', '@novi-ui/core', 'tailwind-variants'],
  },
})

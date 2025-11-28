import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  outDir: 'dist',
  clean: true,
  sourcemap: false,
  splitting: false,
  treeshake: true,
  minify: true,
  esbuildOptions(options) {
    options.drop = ['console']
  },
})

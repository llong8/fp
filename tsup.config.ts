import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: {
    only: true, // 仅生成 .d.ts 文件（保留 tsc 生成 .js 文件）
    resolve: true, // 解析外部类型
  },
  outDir: 'dist',
  clean: false, // 不清理 dist，因为 tsc 会在此处生成 .js 文件
  sourcemap: false,
  splitting: false,
  treeshake: false,
})

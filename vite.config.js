import { defineConfig } from 'vite'
import devServer from '@hono/vite-dev-server'

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'hono/jsx'
  },
  plugins: [
    devServer({
      entry: '/src/index.ts',
    }),
  ],
})
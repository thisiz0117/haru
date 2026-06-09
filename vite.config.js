import { defineConfig } from 'vite'
import devServer from '@hono/vite-dev-server'
import { cloudflare } from '@cloudflare/vite-plugin';

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'hono/jsx'
  },
  plugins: [
    cloudflare()
  ],
  server : {
    port: 8787,
    strictPort: true
  }
})
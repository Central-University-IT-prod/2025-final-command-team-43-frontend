import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import Components from 'unplugin-vue-components/vite';
import {PrimeVueResolver} from '@primevue/auto-import-resolver';


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
		tailwindcss(),
		Components({
      resolvers: [
        PrimeVueResolver()
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
	preview: {
		port: 8000,
		host: true,
		strictPort: true,
		allowedHosts: true
	}
})

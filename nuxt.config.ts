import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', 'shadcn-nuxt', '@pinia/nuxt'],
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
  tailwindcss: {
    cssPath: './assets/css/global.css',
  },
  runtimeConfig: {
    redis: {
      driver: 'redis',
      host: 'adjusted-gazelle-57064.upstash.io',
      password: 'Ad7oAAIncDFmMmNiZWQ3OGJjMzY0MTMxOWRiNzc4ODdkMzc1MTg2M3AxNTcwNjQ',
      port: 6379,
    },
    openaiApiKey: process.env.NUXT_OPENAI_API_KEY,
  },
  nitro: {
    storage: {
      redis: {
        driver: 'redis',
        host: 'adjusted-gazelle-57064.upstash.io',
        password: 'Ad7oAAIncDFmMmNiZWQ3OGJjMzY0MTMxOWRiNzc4ODdkMzc1MTg2M3AxNTcwNjQ',
        port: 6379,
        db: 0,
        tls: {},
      },
    },
  },
  build: {
    transpile: ['vue'],
  },
  vite: {
    server: {
      fs: {
        // Allow Vite to access files outside the project root
        allow: [
          // Allow access to the node_modules directory
          '/Users/jona/node_modules',
          // Allow access to the parent directory (which may contain node_modules)
          '..',
          // For absolute certainty, allow the entire user directory
          '/Users/jona',
        ],
      },
    },
  },
})

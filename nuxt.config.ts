import './server/utils/env'

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
    cssPath: './css/global.css',
  },
  runtimeConfig: {
    redis: {
      driver: 'redis',
      host: 'adjusted-gazelle-57064.upstash.io',
      password: 'Ad7oAAIncDFmMmNiZWQ3OGJjMzY0MTMxOWRiNzc4ODdkMzc1MTg2M3AxNTcwNjQ',
      port: 6379,
    },
    private: {
      plaidClientId: process.env.NUXT_PLAID_CLIENT_ID,
      plaidSecret: process.env.NUXT_PLAID_SECRET,
      plaidEnv: process.env.NUXT_PLAID_ENV,
      plaidProducts: process.env.NUXT_PLAID_PRODUCTS,
      plaidCountryCodes: process.env.NUXT_PLAID_COUNTRY_CODES,
      plaidRedirectUri: process.env.NUXT_PLAID_REDIRECT_URI,
      tursoConnectionUrl: process.env.NUXT_TURSO_CONNECTION_URL,
      tursoAuthToken: process.env.NUXT_TURSO_AUTH_TOKEN,
      openaiApiKey: process.env.NUXT_OPENAI_API_KEY,
      resendApiKey: process.env.NUXT_RESEND_API_KEY,
      redisUrl: process.env.NUXT_REDIS_URL,
      betterAuthSecret: process.env.NUXT_BETTER_AUTH_SECRET,
      betterAuthUrl: process.env.NUXT_BETTER_AUTH_URL,
    },
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
    plugins: ['~/server/plugins/email'],
  },
  build: {
    transpile: ['vue'],
  },
  vite: {
    server: {
      fs: {
        allow: ['/Users/jona/node_modules', '..', '/Users/jona'],
      },
    },
  },
})

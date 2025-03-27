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
})

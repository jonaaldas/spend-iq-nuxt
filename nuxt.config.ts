// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@clerk/nuxt',
    '@nuxtjs/color-mode',
    'nuxt-lucide-icons',
  ],
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
  tailwindcss: {
    cssPath: './assets/css/global.css',
  },
  clerk: {
    skipServerMiddleware: true,
  },
})

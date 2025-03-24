import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './server/database/schema.ts',
  out: './migrations',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.NUXT_TURSO_CONNECTION_URL!,
    authToken: process.env.NUXT_TURSO_AUTH_TOKEN!,
  },
})

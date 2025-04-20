import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'turso',
  schema: './server/database/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.NUXT_TURSO_CONNECTION_URL as string,
    authToken: process.env.NUXT_TURSO_AUTH_TOKEN as string,
  },
})

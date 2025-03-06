import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/libsql'

export const db = drizzle({
  connection: {
    url: process.env.NUXT_TURSO_CONNECTION_URL!,
    authToken: process.env.NUXT_TURSO_AUTH_TOKEN!,
  },
})



import { createEnv } from '@t3-oss/env-nuxt'
import { z } from 'zod'

export const env = createEnv({
  server: {
    NUXT_PLAID_CLIENT_ID: z.string(),
    NUXT_PLAID_SECRET: z.string().min(1),
    NUXT_PLAID_ENV: z.string().min(1),
    NUXT_PLAID_PRODUCTS: z.string().min(1),
    NUXT_PLAID_COUNTRY_CODES: z.string().min(1),
    NUXT_PLAID_REDIRECT_URI: z.string().url(),
    NUXT_TURSO_CONNECTION_URL: z.string().url(),
    NUXT_TURSO_AUTH_TOKEN: z.string().min(1),
    NUXT_OPENAI_API_KEY: z.string().min(1),
    NUXT_RESEND_API_KEY: z.string().min(1),
    NUXT_REDIS_URL: z.string().url(),
    NUXT_BETTER_AUTH_SECRET: z.string().min(1),
    NUXT_BETTER_AUTH_URL: z.string().url(),
  },
})

import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { user, session, account, verification } from '../database/schema'
import { tryCatch } from './tryCatch'
import { db } from '../database/turso'
import { polar } from '@polar-sh/better-auth'
import { Polar } from '@polar-sh/sdk'

const client = new Polar({
  accessToken: process.env.NUXT_POLAR_ACCESS_TOKEN,
  server: 'sandbox',
})

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema: {
      user,
      session,
      account,
      verification,
    },
  }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url, token }, request) => {
      const config = useNitroApp()
      const { error } = await tryCatch(
        config.resend.emails.send({
          from: 'noreply@spendiq.app',
          to: user.email,
          subject: 'Reset your password',
          text: `Click the link to reset your password: ${url}`,
        })
      )
      if (error) {
        console.error(error)
      }
    },
  },
  plugins: [
    polar({
      client,
      createCustomerOnSignUp: true,
      enableCustomerPortal: true,
      checkout: {
        enabled: true,
        products: [
          {
            productId: 'af11d002-cb7a-4265-9e59-b43779f71342',
            slug: 'pro',
          },
        ],
        successUrl: '/success?checkout_id={CHECKOUT_ID}',
      },
    }),
  ],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24, // 1 day
    },
  },
})

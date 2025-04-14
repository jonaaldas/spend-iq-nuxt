import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { user, session, account, verification } from '../database/schema'
import { tryCatch } from './tryCatch'
import { db } from '../database/turso'

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
})

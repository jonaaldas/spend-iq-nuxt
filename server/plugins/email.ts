import { Resend } from 'resend'

export default defineNitroPlugin(nitroApp => {
  const config = useRuntimeConfig()
  const resend = new Resend(config.private.resendApiKey)
  // @ts-ignore
  nitroApp.resend = resend
})

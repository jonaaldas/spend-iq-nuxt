import { Resend } from 'resend'

const resend = new Resend(process.env.NUXT_RESEND_API_KEY)

const email = {
  sendEmail: async (to: string, subject: string, text: string) => {
    await resend.emails.send({
      from: 'noreply@spendiq.app',
      to,
      subject,
      text,
    })
  },
}

export default email

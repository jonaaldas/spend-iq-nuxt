import { auth } from '../utils/auth' // import your auth config
// 30 de Abril o 8 de Mayo
export default defineEventHandler(async event => {
  const allowedEmails = ['jonaaldas@gmail.com']
  if (event.path === '/api/auth/sign-in/email' || event.path === '/api/auth/sign-up/email') {
    const { email } = await readBody(event)
    if (!allowedEmails.includes(email)) {
      return createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }
  }
  return auth.handler(toWebRequest(event))
})

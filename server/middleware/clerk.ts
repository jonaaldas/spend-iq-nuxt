import { clerkMiddleware } from '@clerk/nuxt/server'

export default clerkMiddleware(async event => {
  const { userId } = event.context.auth
  const publicRoutes = ['/', '/api/plaid/']
  const isPublic = publicRoutes.some(route => event.path.startsWith(route))

  if (!userId && !isPublic) {
    return await sendRedirect(event, '/')
  }
})

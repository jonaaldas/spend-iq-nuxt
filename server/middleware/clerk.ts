import { clerkMiddleware } from '@clerk/nuxt/server'

export default clerkMiddleware(async event => {
  const { userId } = event.context.auth
  const publicRoutes = ['/']
  const isPublic = publicRoutes.includes(event.path)

  if (!userId && !isPublic) {
    return await sendRedirect(event, '/')
  }
})

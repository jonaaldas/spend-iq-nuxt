// import { auth } from '~/server/utils/auth'
import { authClient } from '~/lib/auth-client'
export default defineNuxtRouteMiddleware(async (to, from) => {
  // This code runs ONLY on the client during client-side navigation
  if (process.client) {
    const publicRoutes = [
      '/login',
      '/register',
      '/reset-password',
      '/forgot-password',
      '/success',
      '/',
    ]
    if (publicRoutes.includes(to.path)) {
      return
    }

    const { data: loggedIn } = await authClient.useSession(useFetch)
    if (!loggedIn.value) {
      return navigateTo('/login')
    }
  }
})

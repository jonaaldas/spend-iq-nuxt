export default defineNuxtRouteMiddleware(async to => {
  if (import.meta.client) {
    const auth = useState('auth')
    if (!auth.value) {
      return navigateTo('/login')
    }
  }
})

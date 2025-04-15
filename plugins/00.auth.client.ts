import { authClient } from '~/lib/auth-client'

export default defineNuxtPlugin(async nuxt => {
  try {
    const { data: authData } = await authClient.useSession(useFetch)

    const headers = useRequestHeaders()
    const res = await $fetch<any>('/api/auth/state', {
      headers,
    })

    useState('auth', () => {
      return {
        auth: authData,
        polarDetails: res,
      }
    })
  } catch (error) {
    console.error('Failed to get auth data:', error)
    useState('auth', () => {
      return {
        auth: null,
        polarDetails: null,
      }
    })
  }
})

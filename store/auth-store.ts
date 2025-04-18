import { authClient } from '~/lib/auth-client'
import { defineStore } from 'pinia'

interface PolarState {
  activeSubscriptions: Array<{
    status: string
    // Add other subscription properties as needed
  }>
  // Add other polar state properties as needed
}

interface AuthState {
  user: {
    id: string
    email: string
    name: string
    emailVerified: boolean
    createdAt: Date
    updatedAt: Date
    image?: string | null
  }
  session: {
    id: string
    createdAt: Date
    userAgent?: string
  }
}

export const useAuthStore = defineStore('auth', () => {
  const auth = ref<AuthState | null>(null)
  const polarDetails = ref<PolarState | null>(null)
  const isInitialized = ref(false)

  const isLoggedIn = computed(() => {
    return !!auth.value?.user && !!auth.value?.session
  })

  async function getAuthData() {
    if (isInitialized.value) return

    try {
      const { data: authData } = await authClient.useSession(useFetch)
      auth.value = authData

      const headers = useRequestHeaders()
      const res = await $fetch<PolarState>('/api/auth/state', {
        headers,
      })
      polarDetails.value = res

      console.log('polarDetails', polarDetails.value)
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to get auth data:', error)
      auth.value = null
      polarDetails.value = null
      isInitialized.value = true
    }
  }

  return {
    auth: readonly(auth),
    polarDetails: readonly(polarDetails),
    isInitialized: readonly(isInitialized),
    isLoggedIn: readonly(isLoggedIn),
    getAuthData,
  }
})

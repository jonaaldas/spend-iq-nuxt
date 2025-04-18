import { auth } from './auth'
import { type H3Event, createError } from 'h3'
import { tryCatch } from './tryCatch'

type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
type CustomerState = Awaited<ReturnType<typeof auth.api.polarCustomerState>>

// Define the combined session type
interface Session {
  session: AuthSession['session']
  user: AuthSession['user']
  polarCustomerState: CustomerState
}

export const getUserSession = async (event: H3Event): Promise<Session | null> => {
  const customerState = await auth.api.polarCustomerState({
    headers: event.headers,
  })

  const { data: authSession, error } = await tryCatch(
    auth.api.getSession({ headers: event.headers })
  )

  if (error || !authSession) {
    return null
  }

  return {
    ...authSession,
    polarCustomerState: customerState,
  }
}

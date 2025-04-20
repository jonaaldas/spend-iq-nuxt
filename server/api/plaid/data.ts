import { getPlaidData } from './components/fetch-data'

export default defineEventHandler(async event => {
  if (!event.context.auth) {
    return { success: false, error: 'Unauthorized' }
  }
  let userId = event.context.auth?.user.id

  const result = await getPlaidData(event, userId)

  if (!result.success) {
    return {
      success: false,
      error: 'Failed to fetch data',
    }
  }

  return {
    success: true,
    data: {
      transactions: result.transactions,
      accounts: result.accounts,
      institutions: result.institutions,
    },
  }
})

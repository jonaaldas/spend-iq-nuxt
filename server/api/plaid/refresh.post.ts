import { clearCache, getPlaidData } from './components/fetch-data'
import type { PlaidTransactionsResponse, ErrorResponse } from './components/fetch-data'
export default defineEventHandler(async event => {
  const userId = '1'
  const { error } = await tryCatch(clearCache(userId))

  if (error) {
    console.log('Error clearing cache', error)
    return { success: false, error: 'Something went wrong. Please try again later.' }
  }

  const { data: plaidData, error: fetchPlaidDataError } = await tryCatch<
    PlaidTransactionsResponse | ErrorResponse
  >(getPlaidData(event, userId))

  if (fetchPlaidDataError) {
    console.log('Error getting plaid data', fetchPlaidDataError)
    return { success: false, error: 'Something went wrong. Please try again later.' }
  }

  if (plaidData.success) {
    return { success: true }
  }

  return { success: false, error: 'Something went wrong. Please try again later.' }
})

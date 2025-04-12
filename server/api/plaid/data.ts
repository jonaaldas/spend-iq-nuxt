import { getPlaidData } from './components/fetch-data'

export default defineEventHandler(async event => {
  let userId = '1'

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

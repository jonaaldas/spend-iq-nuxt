import { cachedFetchPlaidTransactions } from '~/server/components/transactions'
export default defineEventHandler(async event => {
  const { userId } = event.context.auth

  if (!userId) {
    return createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const transactions = await cachedFetchPlaidTransactions(userId)

  return {
    success: true,
    accounts: transactions.accounts,
  }
})

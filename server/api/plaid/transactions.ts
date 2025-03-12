import { cachedFetchPlaidTransactions } from '~/server/components/transactions'

export default defineEventHandler(async event => {
  const { userId } = event.context.auth

  if (!userId) {
    return createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  try {
    const response = await cachedFetchPlaidTransactions(userId)
    return response
  } catch (error) {
    if (error instanceof Error && error.message === 'No linked bank accounts found') {
      return createError({
        statusCode: 404,
        statusMessage: error.message,
      })
    }

    return createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch transactions',
    })
  }
})

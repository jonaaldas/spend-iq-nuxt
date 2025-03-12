import { cachedFetchPlaidTransactions } from '~/server/components/transactions'

export default defineEventHandler(async event => {
  const { userId } = event.context.auth

  if (!userId) {
    return createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  // Set a timeout for the entire operation
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 15000) // 15-second timeout

  try {
    const response = await cachedFetchPlaidTransactions(userId)
    return response
  } catch (error) {
    console.error('Error in transactions endpoint:', error)

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return createError({
          statusCode: 504,
          statusMessage: 'Gateway Timeout',
          message: 'The request took too long to complete. Please try again.',
        })
      } else if (error.message === 'No linked bank accounts found') {
        return createError({
          statusCode: 404,
          statusMessage: error.message,
        })
      } else if (error.message.includes('Redis') || error.message.includes('Timeout')) {
        return createError({
          statusCode: 503,
          statusMessage: 'Service Temporarily Unavailable',
          message: 'The service is currently experiencing high load. Please try again shortly.',
        })
      }
    }

    return createError({
      statusCode: 500,
      statusMessage: 'Failed to fetch transactions',
    })
  } finally {
    clearTimeout(timeoutId)
  }
})

import { fetchPlaidTransactions } from '~/server/components/transactions'

export default defineEventHandler(async event => {
  const { userId } = event.context.auth

  if (!userId) {
    return createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  try {
    // Get the request body for any specific analysis parameters
    const analysisParams = await readBody(event)

    // Fetch transactions using our helper
    const { transactions, accounts } = await fetchPlaidTransactions(userId)

    // Here you would add your AI analysis logic
    // For now, we'll just return the data
    return {
      success: true,
      analysis: {
        transactionCount: transactions.length,
        accountCount: accounts.length,
        // Add more analysis here
      },
      transactions,
      accounts,
    }
  } catch (error) {
    if (error instanceof Error && error.message === 'No linked bank accounts found') {
      return createError({
        statusCode: 404,
        statusMessage: error.message,
      })
    }

    return createError({
      statusCode: 500,
      statusMessage: 'Failed to analyze transactions',
    })
  }
})

import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { cachedFetchPlaidTransactions } from '~/server/components/transactions'
import type { PlaidTransactionsResponse } from '~/server/components/transactions'

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().openaiApiKey
  if (!apiKey) throw new Error('Missing OpenAI API key')
  const openai = createOpenAI({ apiKey })

  return defineEventHandler(async event => {
    // Set a timeout for the entire operation
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 18000) // 18-second timeout

    try {
      const { messages } = await readBody(event)
      const { userId } = event.context.auth

      if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
      }

      // Fetch transactions with shorter timeout to leave time for AI processing
      const fetchPromise = cachedFetchPlaidTransactions(userId)
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Transaction fetch timeout')), 10000)
      )

      let response: PlaidTransactionsResponse
      try {
        response = await Promise.race([fetchPromise, timeoutPromise])
      } catch (fetchError) {
        console.error('Error fetching transactions for AI analysis:', fetchError)
        throw createError({
          statusCode: 503,
          statusMessage: 'Service temporarily unavailable',
          message: 'Could not retrieve your financial data. Please try again shortly.',
        })
      }

      if (!response.success || !response.transactions.length) {
        throw createError({ statusCode: 404, statusMessage: 'No transactions found' })
      }

      // Limit the amount of transaction data to avoid timeouts
      // Only send most recent 100 transactions to reduce payload size
      const limitedTransactions = response.transactions
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 100)

      const limitedResponse: PlaidTransactionsResponse = {
        success: response.success,
        transactions: limitedTransactions,
        accounts: response.accounts,
        institutions: response.institutions,
      }

      const transactionsString = JSON.stringify(limitedResponse)

      messages.push({
        role: 'user',
        content: `
            You are a financial assistant. You are given a list of transactions and bank account information and balances.
            The user will ask you questions about their financial situation and you will answer their questions as best as possible and as accurate as possible. Only answer what they ask and do not
            add extra information. You are a skilled financial analyst and you are able to analyze the transactions and provide a summary of the user's financial situation.
            Here are the financial records, transactions and bank account information and balances: ${transactionsString}
        `,
      })

      const result = streamText({
        model: openai('gpt-4o-mini'),
        messages,
      })

      return result.toDataStreamResponse({
        getErrorMessage: errorHandler,
      })
    } catch (error) {
      console.error('Error in AI analysis:', error)

      if (error instanceof Error && error.name === 'AbortError') {
        return createError({
          statusCode: 504,
          statusMessage: 'Gateway Timeout',
          message:
            'The AI processing took too long. Please try a simpler question or try again later.',
        })
      }

      throw createError({
        statusCode: 500,
        statusMessage: 'Internal Server Error',
        message: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      clearTimeout(timeoutId)
    }
  })
})

export function errorHandler(error: unknown) {
  if (error == null) {
    return 'unknown error'
  }

  if (typeof error === 'string') {
    return error
  }

  if (error instanceof Error) {
    return error.message
  }
  const stringError = JSON.stringify(error)
  console.log('🚀 ~ errorHandler ~ stringError:', stringError)
  return stringError
}

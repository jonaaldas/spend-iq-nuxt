import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { cachedFetchPlaidTransactions } from '~/server/components/transactions'
import type { PlaidTransactionsResponse } from '~/server/components/transactions'

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().openaiApiKey
  if (!apiKey) throw new Error('Missing OpenAI API key')
  const openai = createOpenAI({ apiKey })

  return defineEventHandler(async event => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 18000)

    try {
      const { userId } = event.context.auth

      if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
      }

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

      const result = streamText({
        model: openai('gpt-4o-mini'),
        messages: [
          {
            role: 'system',
            content: `
            You are a financial analyst and assistant. You will be given a list of transaction and bank account
            information in JSON format. Your goal will be to analyze each transaction and give a response base on the
            message from the user.
            The return format should be in Markdown format. Well detailed and specific. Do not return any extra details that
            are not needed nor ask for. Also you will be given some random string or account identifier you will ignore this
            information as is not needed to analyze the raw data that is given to you.
            Ba careful only return what the user ask for, DO NOT RETURN SENSITIVE INFORMATION back.

            CONTEXT: Here is the list of transaction you will analyze them and give a response based on the message from the user.
            ${transactionsString}
                    `,
          },
        ],
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

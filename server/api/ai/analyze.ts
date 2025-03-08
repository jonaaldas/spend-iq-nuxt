import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { cachedFetchPlaidTransactions } from '~/server/components/transactions'

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().openaiApiKey
  if (!apiKey) throw new Error('Missing OpenAI API key')
  const openai = createOpenAI({ apiKey })

  return defineEventHandler(async event => {
    try {
      const { messages } = await readBody(event)
      const { userId } = event.context.auth

      if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
      }

      const response = await cachedFetchPlaidTransactions(userId)
      if (!response.success || !response.transactions.length) {
        throw createError({ statusCode: 404, statusMessage: 'No transactions found' })
      }

      const transactionsString = JSON.stringify(response)

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
    } catch (error: unknown) {
      console.error(error instanceof Error ? error.message : 'Unknown error occurred')
      throw createError({
        statusCode: 500,
        statusMessage: 'There was an error please try again later',
      })
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

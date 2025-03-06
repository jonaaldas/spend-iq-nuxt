import { fetchPlaidTransactions } from '~/server/components/transactions'
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'

export default defineLazyEventHandler(async () => {
  const apiKey = useRuntimeConfig().openaiApiKey
  if (!apiKey) throw new Error('Missing OpenAI API key')
  const openai = createOpenAI({ apiKey })

  // Create a cached handler for fetching transactions
  const getTransactions = cachedEventHandler(
    async event => {
      const { userId } = event.context.auth as { userId: string }
      return await fetchPlaidTransactions(userId)
    },
    {
      // Cache for 1 hour
      maxAge: 60 * 60,
      // Use userId as part of the cache key
      getKey: event => `transactions:${event.context.auth.userId}`,
    }
  )

  return defineEventHandler(async event => {
    try {
      const { messages } = await readBody(event)
      const { userId } = event.context.auth

      if (!userId) {
        throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
      }

      // Use the cached handler
      const transactions = await getTransactions(event)
      const transactionsString = JSON.stringify(transactions.transactions)

      messages.push({
        role: 'user',
        content: `Here are the transactions: ${transactionsString}`,
      })

      const result = streamText({
        model: openai('gpt-4o'),
        messages,
      })

      return result.toDataStreamResponse()
    } catch (error) {
      console.error(error.message)
      throw createError({
        statusCode: 500,
        statusMessage: 'There was an error please try again later',
      })
    }
  })
})

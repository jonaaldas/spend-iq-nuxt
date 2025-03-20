import { db } from '~/server/database/turso'
import { plaidItems } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import {
  cachedFetchPlaidTransactions,
  clearTransactionsCache,
} from '~/server/components/transactions'
import { client } from '~/server/lib/plaid'

export default defineEventHandler(async event => {
  const { userId } = event.context.auth
  const body = await readBody(event)
  const { itemId } = body

  if (!userId || !itemId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required parameters',
    })
  }

  try {
    const item = await db
      .select()
      .from(plaidItems)
      .where(and(eq(plaidItems.userId, userId), eq(plaidItems.itemId, itemId)))

    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Item not found',
      })
    }

    await client.itemRemove({
      access_token: item[0].accessToken,
    })

    await db
      .delete(plaidItems)
      .where(and(eq(plaidItems.userId, userId), eq(plaidItems.itemId, itemId)))

    const { success, error } = await clearTransactionsCache(userId)

    if (!success) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to clear transactions cache',
      })
    }

    const { data: data, error: error2 } = await tryCatch(cachedFetchPlaidTransactions(userId))

    if (error2) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Failed to fetch transactions',
      })
    }

    return {
      success: true,
      message: 'Account disconnected successfully',
    }
  } catch (error) {
    console.error('Error disconnecting account:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to disconnect account',
    })
  }
})

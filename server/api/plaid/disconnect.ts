import { db } from '~/server/database/turso'
import { plaidItems } from '~/server/database/schema'
import { eq, and } from 'drizzle-orm'
import { clearTransactionsCache } from '~/server/components/transactions'
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
    // Find the access token for this item
    const item = await db
      .select()
      .from(plaidItems)
      .where(and(eq(plaidItems.userId, userId), eq(plaidItems.itemId, itemId)))

    console.log('🚀 ~ item:', item)
    if (!item) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Item not found',
      })
    }

    // Remove the item from Plaid
    await client.itemRemove({
      access_token: item[0].accessToken,
    })

    // Delete the item from our database
    await db
      .delete(plaidItems)
      .where(and(eq(plaidItems.userId, userId), eq(plaidItems.itemId, itemId)))

    // Clear the transactions cache
    await clearTransactionsCache(userId)

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

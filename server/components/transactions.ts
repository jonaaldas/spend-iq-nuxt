import { db } from '~/server/database/turso'
import { eq } from 'drizzle-orm'
import { plaidItems } from '~/server/database/schema'
import { client } from '~/server/lib/plaid'
import { format, subMonths } from 'date-fns'
import redis from '~/server/lib/redis'

interface Institution {
  name: string
  institution_id: string
}

interface PlaidTransactionsResponse {
  success: boolean
  transactions: any[]
  accounts: any[]
  institutions: Institution[]
}

const getCacheKey = (userId: string): string => {
  const isDev = process.env.NODE_ENV !== 'production'
  const prefix = isDev ? 'TRANSACTIONS_DEV_' : 'TRANSACTIONS_PROD_'
  return `${prefix}${userId}`
}

export const fetchPlaidTransactions = async (
  userId: string
): Promise<PlaidTransactionsResponse> => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  const usersAccessTokens = await db.select().from(plaidItems).where(eq(plaidItems.userId, userId))

  if (usersAccessTokens.length === 0) {
    throw new Error('No linked bank accounts found')
  }

  const today = new Date()
  const startDate = format(subMonths(today, 1), 'yyyy-MM-dd')
  const endDate = format(today, 'yyyy-MM-dd')

  // For each item, fetch transactions and accounts
  const allTransactions: any[] = []
  const allAccounts: any[] = []
  const institutions: Record<string, Institution> = {}

  for (const item of usersAccessTokens) {
    try {
      const accessToken = item.accessToken

      let hasMore = true
      let cursor: string | undefined = undefined
      let itemTransactions: any[] = []

      while (hasMore) {
        const transactionsResponse = await client.transactionsSync({
          access_token: accessToken,
          cursor: cursor,
          count: 100,
        })

        const { added, has_more, next_cursor } = transactionsResponse.data

        // Add transactions to our collection
        itemTransactions = [...itemTransactions, ...added]

        // Update pagination state
        hasMore = has_more
        cursor = next_cursor

        // Break if we've got a lot of transactions already
        if (itemTransactions.length > 500) break
      }

      // Get accounts
      const accountsResponse = await client.accountsGet({
        access_token: accessToken,
      })

      // Store institution info
      institutions[item.institutionId] = {
        name: item.institutionName,
        institution_id: item.institutionId,
      }

      // Attach institution info to accounts
      const accountsWithInstitution = accountsResponse.data.accounts.map(account => ({
        ...account,
        institution: {
          name: item.institutionName,
          institution_id: item.institutionId,
        },
        item_id: item.itemId,
      }))

      // Add to collections
      allAccounts.push(...accountsWithInstitution)
      allTransactions.push(...itemTransactions)
    } catch (error) {
      console.error(`Error fetching data for item ${item.itemId}:`, error)
      // Continue with other items even if one fails
    }
  }

  return {
    success: true,
    transactions: allTransactions,
    accounts: allAccounts,
    institutions: Object.values(institutions),
  }
}

export const clearTransactionsCache = async (userId: string): Promise<void> => {
  const cacheKey = getCacheKey(userId)
  await redis.del(cacheKey)
}

export const cachedFetchPlaidTransactions = async (
  userId: string
): Promise<PlaidTransactionsResponse> => {
  const cacheKey = getCacheKey(userId)

  // Try to get data from cache
  const cachedData = await redis.get(cacheKey)
  if (cachedData) {
    return JSON.parse(cachedData)
  }

  // If not in cache, fetch fresh data
  const data = await fetchPlaidTransactions(userId)

  // Store in cache for 1 hour (3600 seconds)
  await redis.set(cacheKey, JSON.stringify(data), 'EX', 3600)

  return data
}

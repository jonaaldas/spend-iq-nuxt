import { db } from '~/server/database/turso'
import { eq } from 'drizzle-orm'
import { plaidItems } from '~/server/database/schema'
import { client } from '~/server/lib/plaid'
import { format, subMonths } from 'date-fns'
import redis from '~/server/lib/redis'
import type { TransactionsSyncResponse, AccountsGetResponse } from 'plaid'

interface Institution {
  name: string
  institution_id: string
}

export interface PlaidTransactionsResponse {
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

// Promise with timeout wrapper to prevent hanging requests
const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout after ${timeoutMs}ms: ${errorMessage}`))
    }, timeoutMs)

    promise
      .then(result => {
        clearTimeout(timeout)
        resolve(result)
      })
      .catch(error => {
        clearTimeout(timeout)
        reject(error)
      })
  })
}

export const fetchPlaidTransactions = async (
  userId: string
): Promise<PlaidTransactionsResponse> => {
  if (!userId) {
    throw new Error('User ID is required')
  }

  try {
    // Add timeout to database query
    const { data: usersAccessTokens, error } = await tryCatch(
      db.select().from(plaidItems).where(eq(plaidItems.userId, userId))
    )

    if (error) {
      throw error
    }

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

    // Limit the number of items processed to avoid timeouts
    const maxItemsToProcess = Math.min(usersAccessTokens.length, 3)

    // Process items concurrently with Promise.all for better performance
    const { error: processedItemsError } = await tryCatch(
      Promise.all(
        usersAccessTokens.slice(0, maxItemsToProcess).map(async item => {
          try {
            const accessToken = item.accessToken

            let hasMore = true
            let cursor: string | undefined = undefined
            let itemTransactions: any[] = []
            let fetchAttempts = 0
            const maxFetchAttempts = 2

            while (hasMore && fetchAttempts < maxFetchAttempts) {
              try {
                // Add timeout to Plaid API call
                const transactionsResponse: { data: TransactionsSyncResponse } = await withTimeout(
                  client.transactionsSync({
                    access_token: accessToken,
                    cursor: cursor,
                    count: 50, // Reduced from 100 for faster response
                  }),
                  8000, // 8 second timeout
                  `Plaid transactionsSync timed out for item ${item.itemId}`
                )

                const { added, has_more, next_cursor } = transactionsResponse.data

                // Add transactions to our collection
                itemTransactions = [...itemTransactions, ...added]

                // Update pagination state
                hasMore = has_more
                cursor = next_cursor
                fetchAttempts++

                // Break earlier with fewer transactions to avoid timeouts
                if (itemTransactions.length > 100) {
                  hasMore = false
                  break
                }
              } catch (error) {
                console.error(`Error in transaction sync for item ${item.itemId}:`, error)
                hasMore = false
              }
            }

            // Get accounts with timeout
            const accountsResponse: { data: AccountsGetResponse } = await withTimeout(
              client.accountsGet({
                access_token: accessToken,
              }),
              5000, // 5 second timeout
              `Plaid accountsGet timed out for item ${item.itemId}`
            )

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

            return {
              success: true,
              transactions: allTransactions,
              accounts: allAccounts,
              institutions: institutions,
            }
          } catch (error) {
            console.error(`Error fetching data for item ${item.itemId}:`, error)
            // Continue with other items even if one fails
          }
        })
      )
    )

    if (processedItemsError) {
      throw processedItemsError
    }

    return {
      success: true,
      transactions: allTransactions,
      accounts: allAccounts,
      institutions: Object.values(institutions),
    }
  } catch (error) {
    console.error('Error in fetchPlaidTransactions:', error)
    if (error instanceof Error && error.message === 'No linked bank accounts found') {
      throw error
    }
    throw new Error(
      `Failed to fetch transactions: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

export const clearTransactionsCache = async (
  userId: string
): Promise<{
  success: boolean
  error?: Error | null
}> => {
  const cacheKey = getCacheKey(userId)
  const { error } = await tryCatch(redis.del(cacheKey))
  if (error) {
    return {
      success: false,
      error: error,
    }
  }
  return {
    success: true,
  }
}

export const cachedFetchPlaidTransactions = async (
  userId: string
): Promise<PlaidTransactionsResponse> => {
  const cacheKey = getCacheKey(userId)

  try {
    // Try to get data from cache with timeout
    const { data: cachedData, error } = await tryCatch(useStorage('redis').getItem(cacheKey))

    if (cachedData) {
      console.log('Cache hit')
      return cachedData as PlaidTransactionsResponse
    }

    const { data, error: fetchError } = await tryCatch(fetchPlaidTransactions(userId))

    if (fetchError) {
      throw fetchError
    }

    const { data: setCacheData, error: setCacheError } = await tryCatch(
      useStorage('redis').setItem(cacheKey, data)
    )

    if (setCacheError) {
      throw setCacheError
    }

    return data
  } catch (error) {
    console.error('Error in cachedFetchPlaidTransactions:', error)

    // If we have a cache error, try direct fetch as fallback
    if (error instanceof Error && error.message.includes('Redis')) {
      return fetchPlaidTransactions(userId)
    }

    throw error
  }
}

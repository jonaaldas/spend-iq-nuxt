import { db } from '~/server/database/turso'
import { eq } from 'drizzle-orm'
import { plaidItems } from '~/server/database/schema'
import { client } from '~/server/lib/plaid'
import { format, subMonths } from 'date-fns'

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

export const cachedFetchPlaidTransactions = defineCachedFunction(
  async (userId: string): Promise<PlaidTransactionsResponse> => {
    if (!userId) {
      throw new Error('User ID is required')
    }

    const usersAccessTokens = await db
      .select()
      .from(plaidItems)
      .where(eq(plaidItems.userId, userId))

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
  },
  {
    maxAge: 60 * 60, // 1 hour
    getKey: (userId: string) => {
      return `transactions:${userId}`
    },
    name: 'transactions',
  }
)

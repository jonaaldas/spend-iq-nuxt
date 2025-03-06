import { db } from '~/server/database/turso'
import { eq } from 'drizzle-orm'
import { plaidItems } from '~/server/database/schema'
import { client } from '~/server/lib/plaid'
import { type TransactionsSyncRequest } from 'plaid'
import { format, subMonths } from 'date-fns'
interface PlaidItem {
  item_id: string
  access_token: string
  institution_id: string
  institution_name: string
  date_connected: string
}

interface PlaidItem {
  item_id: string
  access_token: string
  institution_id: string
  institution_name: string
  date_connected: string
}

interface Institution {
  name: string
  institution_id: string
}
export default defineEventHandler(async event => {
  const { userId } = event.context.auth

  if (!userId) {
    return createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const usersAccessTokens = await db.select().from(plaidItems).where(eq(plaidItems.userId, userId))

  if (usersAccessTokens.length === 0) {
    return createError({
      statusCode: 404,
      statusMessage: 'No linked bank accounts found',
    })
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
        // This is to prevent excessive API calls during development
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
})

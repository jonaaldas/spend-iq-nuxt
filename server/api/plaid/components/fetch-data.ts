import { Transaction, AccountBase, TransactionsSyncResponse, AccountsGetResponse } from 'plaid'
import { format, subMonths } from 'date-fns'
import { eq } from 'drizzle-orm'
import { plaidItems } from '~/server/database/schema'
import type { PlaidItem } from '~/server/database/schema'
import { tryCatch } from '~/server/utils/tryCatch'
import type { H3Event } from 'h3'
import { db } from '~/server/database/turso'
// Simplified Institution type that matches our needs
interface SimpleInstitution {
  name: string
  institution_id: string
}

interface ProcessedPlaidItem {
  success: true
  transactions: Transaction[]
  accounts: (AccountBase & {
    institution: SimpleInstitution
    item_id: string
  })[]
  institutions: Record<string, SimpleInstitution>
}

export interface PlaidTransactionsResponse {
  success: true
  transactions: Transaction[]
  accounts: (AccountBase & {
    institution: SimpleInstitution
    item_id: string
  })[]
  institutions: Record<string, SimpleInstitution>
}

export interface ErrorResponse {
  success: false
}

async function getPlaidDataUncached(
  userId: string
): Promise<PlaidTransactionsResponse | ErrorResponse> {
  if (!userId) {
    return { success: false }
  }

  const { data: usersAccessTokens, error } = await tryCatch<PlaidItem[]>(
    db.select().from(plaidItems).where(eq(plaidItems.userId, userId))
  )

  if (error || !usersAccessTokens || usersAccessTokens.length === 0) {
    return { success: false }
  }

  const today = new Date()
  const startDate = format(subMonths(today, 1), 'yyyy-MM-dd')
  const endDate = format(today, 'yyyy-MM-dd')

  const allTransactions: Transaction[] = []
  const allAccounts: (AccountBase & { institution: SimpleInstitution; item_id: string })[] = []
  const institutions: Record<string, SimpleInstitution> = {}

  const maxItemsToProcess = Math.min(usersAccessTokens.length, usersAccessTokens.length)

  type ItemResult = ProcessedPlaidItem | ErrorResponse
  const { data: processedItems, error: processedItemsError } = await tryCatch<ItemResult[]>(
    Promise.all(
      usersAccessTokens.slice(0, maxItemsToProcess).map(async (item: PlaidItem) => {
        const accessToken = item.accessToken

        let hasMore = true
        let cursor: string | undefined = undefined
        let itemTransactions: Transaction[] = []
        let fetchAttempts = 0
        const maxFetchAttempts = 2

        while (hasMore && fetchAttempts < maxFetchAttempts) {
          const response = await client.transactionsSync({
            access_token: accessToken,
            cursor: cursor,
            count: 50,
          })

          const { data: transactionsResponse, error: transactionsError } =
            await tryCatch<TransactionsSyncResponse>(Promise.resolve(response.data))

          if (transactionsError || !transactionsResponse) {
            return { success: false } as ErrorResponse
          }

          const { added, has_more, next_cursor } = transactionsResponse

          // add the institution name to the transactions
          const institutionName = item.institutionName
          const transactionsWithInstitution = added.map(transaction => ({
            ...transaction,
            institution_name: institutionName,
          }))

          itemTransactions = [...itemTransactions, ...transactionsWithInstitution]
          hasMore = has_more
          cursor = next_cursor
          fetchAttempts++

          if (itemTransactions.length > 100) {
            hasMore = false
            break
          }
        }

        const response = await client.accountsGet({
          access_token: accessToken,
        })

        const { data: accountsResponse, error: accountsError } =
          await tryCatch<AccountsGetResponse>(Promise.resolve(response.data))

        if (accountsError || !accountsResponse) {
          return { success: false } as ErrorResponse
        }

        const institution: SimpleInstitution = {
          name: item.institutionName,
          institution_id: item.institutionId,
        }

        institutions[item.institutionId] = institution

        const accountsWithInstitution = accountsResponse.accounts.map((account: AccountBase) => ({
          ...account,
          institution,
          item_id: item.itemId,
        }))

        allAccounts.push(...accountsWithInstitution)
        allTransactions.push(...itemTransactions)

        return {
          success: true,
          transactions: allTransactions,
          accounts: allAccounts,
          institutions,
        } as ProcessedPlaidItem
      })
    )
  )

  if (processedItemsError || !processedItems) {
    return { success: false }
  }

  const successfulItems = processedItems.filter(
    (item): item is ProcessedPlaidItem => item.success === true
  )

  if (successfulItems.length === 0) {
    return { success: false }
  }

  const lastItem = successfulItems[successfulItems.length - 1]
  return {
    success: true,
    transactions: lastItem.transactions,
    accounts: lastItem.accounts,
    institutions: lastItem.institutions,
  }
}

const getPlaidData = defineCachedFunction(
  async (event: H3Event, userId: string) => {
    return getPlaidDataUncached(userId)
  },
  {
    getKey: event => {
      return getCachePrefix('1')
    },
    base: 'redis',
    swr: false,
    maxAge: 60 * 60, //1h
  }
)

function getCachePrefix(userId: string): string {
  return `plaid:${userId}`
}

async function clearCache(userId: string): Promise<void> {
  const cachePrefix = getCachePrefix(userId)
  const storage = useStorage('redis')
  await storage.removeItem(`nitro:functions:_:${cachePrefix}.json`)
}

export { getPlaidData, getCachePrefix, clearCache }

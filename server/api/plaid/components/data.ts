import { Transaction, AccountBase, TransactionsSyncResponse, AccountsGetResponse } from 'plaid'
import { format, subMonths } from 'date-fns'
import { eq } from 'drizzle-orm'
import { db } from '~/server/database/turso'
import { plaidItems } from '~/server/database/schema'
import type { PlaidItem } from '~/server/database/schema'
import { tryCatch } from '~/server/utils/tryCatch'
import type { AxiosResponse } from 'axios'

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

interface PlaidTransactionsResponse {
  success: true
  transactions: Transaction[]
  accounts: (AccountBase & {
    institution: SimpleInstitution
    item_id: string
  })[]
  institutions: Record<string, SimpleInstitution>
}

interface ErrorResponse {
  success: false
}

async function getPlaidData(userId: string): Promise<PlaidTransactionsResponse | ErrorResponse> {
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

  const maxItemsToProcess = Math.min(usersAccessTokens.length, 3)

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

          itemTransactions = [...itemTransactions, ...added]
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

function getCachePrefix(userId: string): string {
  return `plaid:${userId}`
}

function clearCache(userId: string): void {}

export { getPlaidData }

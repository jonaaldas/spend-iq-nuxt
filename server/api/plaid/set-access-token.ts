import { CountryCode } from 'plaid'
import { client } from '~/server/lib/plaid'
import { db } from '~/server/database/turso'
import { plaidItems } from '~/server/database/schema'
import { clearTransactionsCache } from '~/server/components/transactions'

export default defineEventHandler(async event => {
  try {
    const { userId } = event.context.auth
    if (!userId) {
      return createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }

    const { public_token } = await readBody(event)

    // Set a timeout for the entire operation
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 15000) // 15-second timeout

    try {
      const tokenResponse = await client.itemPublicTokenExchange({
        public_token,
      })

      const ACCESS_TOKEN = tokenResponse.data.access_token
      const ITEM_ID = tokenResponse.data.item_id

      // We can run these in parallel to optimize response time
      const [itemResponse, accountsResponse] = await Promise.all([
        client.itemGet({
          access_token: ACCESS_TOKEN,
        }),
        client.accountsGet({
          access_token: ACCESS_TOKEN,
        }),
      ])

      const institutionId = itemResponse.data.item.institution_id || ''

      // Only fetch institution details if we have an ID
      let institutionName = 'Connected Account' // Default fallback name

      if (institutionId) {
        try {
          const institutionResponse = await client.institutionsGetById({
            institution_id: institutionId,
            country_codes: ['US'] as CountryCode[],
          })

          institutionName = institutionResponse.data.institution.name
        } catch (instError) {
          console.error('Error fetching institution details, using default name:', instError)
        }
      }

      const timestamp = new Date().toISOString()

      // Save to database
      await db.insert(plaidItems).values({
        userId,
        itemId: ITEM_ID,
        accessToken: ACCESS_TOKEN,
        institutionId,
        institutionName,
        dateConnected: timestamp,
        accounts: JSON.stringify(accountsResponse.data.accounts),
      })

      // Clear the Redis cache for this user's transactions
      // Don't await this to avoid blocking the response
      clearTransactionsCache(userId).catch(error =>
        console.error('Failed to clear cache, but proceeding anyway:', error)
      )

      return {
        success: true,
        institution_name: institutionName,
        accounts: accountsResponse.data.accounts.length,
      }
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error) {
    console.error('Error exchanging public token:', error)

    if (error instanceof Error && error.name === 'AbortError') {
      return createError({
        statusCode: 504,
        statusMessage: 'Gateway Timeout',
        message: 'The request took too long to complete. Please try again.',
      })
    }

    return createError({
      statusCode: 500,
      statusMessage: 'Failed to exchange public token',
    })
  }
})

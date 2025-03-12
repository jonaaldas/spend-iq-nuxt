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

    const tokenResponse = await client.itemPublicTokenExchange({
      public_token,
    })

    const ACCESS_TOKEN = tokenResponse.data.access_token
    const ITEM_ID = tokenResponse.data.item_id

    const itemResponse = await client.itemGet({
      access_token: ACCESS_TOKEN,
    })

    const institutionId = itemResponse.data.item.institution_id || ''

    const institutionResponse = await client.institutionsGetById({
      institution_id: institutionId,
      country_codes: ['US'] as CountryCode[],
    })

    const institutionName = institutionResponse.data.institution.name

    const accountsResponse = await client.accountsGet({
      access_token: ACCESS_TOKEN,
    })

    const timestamp = new Date().toISOString()

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
    await clearTransactionsCache(userId)

    return {
      success: true,
      institution_name: institutionName,
      accounts: accountsResponse.data.accounts.length,
    }
  } catch (error) {
    console.error('Error exchanging public token:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to exchange public token',
    })
  }
})

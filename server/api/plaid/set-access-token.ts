import { CountryCode } from 'plaid'
import { client } from '~/server/lib/plaid'
import redis from '~/server/lib/redis'

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

    // Get accounts for this item
    const accountsResponse = await client.accountsGet({
      access_token: ACCESS_TOKEN,
    })

    // Store item information including the timestamp
    const timestamp = new Date().toISOString()
    const itemData = {
      item_id: ITEM_ID,
      access_token: ACCESS_TOKEN,
      institution_id: institutionId,
      institution_name: institutionName,
      date_connected: timestamp,
      accounts: accountsResponse.data.accounts,
    }

    await redis.set(`plaid-nuxt:${userId}:item`, JSON.stringify(itemData))

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

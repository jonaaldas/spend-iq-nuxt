import { CountryCode } from 'plaid'
import { client } from '~/server/utils/plaid'
import { plaidItems } from '~/server/database/schema'
import * as z from 'zod'
import { clearCache } from './components/fetch-data'
import { db } from '~/server/database/turso'
const schema = z.object({
  public_token: z.string(),
})

export default defineEventHandler(async event => {
  if (!event.context.auth) {
    return { success: false, error: 'Unauthorized' }
  }
  let userId = event.context.auth?.user.id
  const { public_token } = await readValidatedBody(event, schema.parse)

  const { data: tokenResponse, error } = await tryCatch(
    client.itemPublicTokenExchange({ public_token })
  )

  if (error) {
    console.log('Token Response Error', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }

  const ACCESS_TOKEN = tokenResponse.data.access_token
  const ITEM_ID = tokenResponse.data.item_id

  const itemResponse = await client.itemGet({
    access_token: ACCESS_TOKEN,
  })

  const accountsResponse = await client.accountsGet({
    access_token: ACCESS_TOKEN,
  })

  const { data: itemsResponse, error: itemsError } = await tryCatch(Promise.resolve(itemResponse))
  if (itemsError) {
    console.log('Items Response Error', itemsError)
    return {
      success: false,
      error: itemsError instanceof Error ? itemsError.message : 'An unexpected error occurred',
    }
  }

  const { data: accountResponse, error: accountError } = await tryCatch(
    Promise.resolve(accountsResponse)
  )

  if (accountError) {
    console.log('Accounts Response Error', accountError)
    return {
      success: false,
      error: accountError instanceof Error ? accountError.message : 'An unexpected error occurred',
    }
  }

  const institutionId = itemsResponse.data.item.institution_id || ''
  let institutionName = 'Connected Account'

  if (!institutionId) {
    return {
      success: false,
      error: 'No institution ID found',
    }
  }

  const { data: institutionResponse, error: institutionError } = await tryCatch(
    client.institutionsGetById({
      institution_id: institutionId,
      country_codes: ['US', 'ES'] as CountryCode[],
    })
  )
  if (institutionError) {
    return {
      success: false,
      error:
        institutionError instanceof Error
          ? institutionError.message
          : 'An unexpected error occurred',
    }
  }
  institutionName = institutionResponse.data.institution.name

  const timestamp = new Date().toISOString()
  const { data: insertResponse, error: insertError } = await tryCatch(
    db.insert(plaidItems).values({
      userId,
      itemId: ITEM_ID,
      accessToken: ACCESS_TOKEN,
      institutionId,
      institutionName,
      dateConnected: timestamp,
      accounts: JSON.stringify(accountResponse.data.accounts),
    })
  )
  if (insertError) {
    return {
      success: false,
      error: insertError instanceof Error ? insertError.message : 'An unexpected error occurred',
    }
  }
  // Clear the Redis cache for this user's transactions
  await clearCache(userId)

  return {
    success: true,
    institution_name: institutionName,
    accounts: accountResponse.data.accounts.length,
  }
})

import { Products, CountryCode } from 'plaid'
import { client } from '~/server/lib/plaid'

export default defineEventHandler(async event => {
  try {
    const { userId } = event.context.auth

    if (!userId) {
      return createError({
        statusCode: 401,
        statusMessage: 'Unauthorized',
      })
    }

    const request = {
      user: { client_user_id: userId },
      client_name: 'Personal Finance Dashboard',
      products: [Products.Transactions, Products.Investments, Products.Auth],
      country_codes: [CountryCode.Us, CountryCode.Es],
      language: 'en',
    }
    const response = await client.linkTokenCreate(request)
    return response.data
  } catch (error) {
    console.error('Error creating link token:', error)
    return createError({
      statusCode: 500,
      statusMessage: 'Failed to create link token',
    })
  }
})

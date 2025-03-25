import { Products, CountryCode } from 'plaid'

export default defineEventHandler(async event => {
  const request = {
    user: { client_user_id: '1' },
    client_name: 'Personal Finance Dashboard',
    products: [Products.Transactions, Products.Investments, Products.Auth],
    country_codes: [CountryCode.Us, CountryCode.Es],
    language: 'en',
  }

  const { data: response, error } = await tryCatch(client.linkTokenCreate(request))

  if (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }

  return {
    success: true,
    data: {
      linkToken: response.data.link_token,
      expiration: response.data.expiration,
      request_id: response.data.request_id,
    },
  }
})

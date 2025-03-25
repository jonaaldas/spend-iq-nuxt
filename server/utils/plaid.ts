import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'

if (!process.env.NUXT_PLAID_CLIENT_ID || !process.env.NUXT_PLAID_SECRET) {
  throw new Error('Missing Plaid credentials in environment variables')
}

const configuration = new Configuration({
  basePath: PlaidEnvironments['sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.NUXT_PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.NUXT_PLAID_SECRET,
    },
  },
})

export const client = new PlaidApi(configuration)

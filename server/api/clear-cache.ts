import { clearCache } from './plaid/components/fetch-data'

export default defineEventHandler(async event => {
  await clearCache('1')
  return {
    message: 'Cache operations completed',
  }
})

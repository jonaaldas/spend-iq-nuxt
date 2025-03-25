import { getPlaidData } from './components/data'

export default defineEventHandler(async event => {
  let userId = '1'
  const result = await getPlaidData(userId)
  if (!result.success) {
    return {
      success: false,
      error: 'Failed to fetch data',
    }
  }
  return {
    success: true,
    data: result,
  }
})

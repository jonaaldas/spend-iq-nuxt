import { auth } from '../utils/auth'
export default defineEventHandler(async event => {
  const headers = getHeaders(event)
  const res = await tryCatch(
    auth.api.polarCheckoutWithSlug({
      params: {
        slug: 'pro',
      },
      header: headers,
      path: '/api/auth/checkout/pro',
      query: {
        productId: 'af11d002-cb7a-4265-9e59-b43779f71342',
      },
    })
  )
  return res
})

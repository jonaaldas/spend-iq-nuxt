import { client } from '~/server/lib/plaid'
import redis from '~/server/lib/redis'
interface PlaidItem {
  item_id: string
  access_token: string
  institution_id: string
  institution_name: string
  date_connected: string
}
export default defineEventHandler(async event => {
  const { userId } = event.context.auth
  const item = await redis.get(`plaid-nuxt:${userId}:item`)
  if (!item) {
    return createError({
      statusCode: 404,
      statusMessage: 'Item not found',
    })
  }

  const itemsResponse = await client.itemGet({
    access_token: JSON.parse(item).access_token,
  })
  if (!itemsResponse.data.item) {
    return createError({
      statusCode: 404,
      statusMessage: 'No linked bank accounts found',
    })
  }

  const items: PlaidItem[] = [
    {
      item_id: itemsResponse.data.item.item_id,
      access_token: JSON.parse(item).access_token,
      institution_id: itemsResponse.data.item.institution_id || '',
      institution_name: itemsResponse.data.item.institution_id || 'Unknown Institution',
      date_connected: new Date().toISOString(),
    },
  ]

  return items
})

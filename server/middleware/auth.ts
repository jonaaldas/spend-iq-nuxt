import { getUserSession } from '../utils/getSession'

export default defineEventHandler(async event => {
  try {
    const session = await getUserSession(event)
    if (session) {
      event.context.auth = session
    } else {
      event.context.auth = null
    }
  } catch (error) {
    event.context.auth = null
  }
})

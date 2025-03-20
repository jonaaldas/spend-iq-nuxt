export default defineEventHandler(async event => {
  const { userId } = event.context.auth

  if (!userId) {
    return createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  return {
    message: 'Hello, world!',
  }
})

export default defineEventHandler(async event => {
  const transaction = readBody(event)
  console.log(transaction)
  return {
    success: true,
    message: 'Financial data received',
  }
})

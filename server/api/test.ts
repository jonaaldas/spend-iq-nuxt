import { Effect, Console } from 'effect'
export default defineEventHandler(async event => {
  const program = Console.log('Hello, World!')

  Effect.runSync(program)

  return {
    message: 'Hello, world!',
  }
})

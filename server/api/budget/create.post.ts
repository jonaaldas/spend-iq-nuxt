import { db } from '~/server/database/turso'
// import { budgets } from '~/server/database/schema'
import type { BudgetCreateInput, BudgetResponse } from '~/types/budget.types'

export default defineEventHandler(async (event): Promise<BudgetResponse> => {
  const { userId } = event.context.auth

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const body = await readBody(event)
  const { name, amount, category, duration } = body as BudgetCreateInput

  if (!name || !amount || !category || !duration) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    })
  }

  // TODO: Add budget creation to Turso
  //   const budget = await db
  //     .insert(budgets)
  //     .values({
  //       name,
  //       amount,
  //       category,
  //       duration,
  //       userId,
  //       createdAt: new Date(),
  //       updatedAt: new Date(),
  //     })
  //     .returning()

  const budget = [
    {
      id: crypto.randomUUID(),
      name,
      amount,
      category,
      duration,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ]

  return {
    success: true,
    data: budget[0],
  }
})

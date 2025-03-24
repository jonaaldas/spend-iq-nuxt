import { db } from '~/server/database/turso'
// import { budgets } from '~/server/db/schema'
import { eq } from 'drizzle-orm'
import type { BudgetResponse, Budget } from '~/types/budget.types'

export default defineEventHandler(async (event): Promise<BudgetResponse> => {
  const { userId } = event.context.auth

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  // const userBudgets = await db
  //   .select()
  //   .from(budgets)
  //   .where(eq(budgets.userId, userId))
  //   .where(eq(budgets.deletedAt, null))
  const userBudgets: Budget[] = [
    {
      id: '1',
      name: 'Test Budget',
      amount: 100,
      category: 'Test Category',
      duration: 'Monthly',
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    },
  ]

  return {
    success: true,
    data: userBudgets,
  }
})

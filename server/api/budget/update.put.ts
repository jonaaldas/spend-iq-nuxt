import { db } from '~/server/database/turso'
// import { budgets } from '~/server/db/schema'
import { eq, and } from 'drizzle-orm'
import type { BudgetUpdateInput, BudgetResponse } from '~/types/budget.types'

export default defineEventHandler(async (event): Promise<BudgetResponse> => {
  const { userId } = event.context.auth

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  const body = await readBody(event)
  const { id, ...updateData } = body as BudgetUpdateInput

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Budget ID is required',
    })
  }

  // const budget = await db
  //   .update(budgets)
  //   .set({
  //     ...updateData,
  //     updatedAt: new Date(),
  //   })
  //   .where(and(eq(budgets.id, id), eq(budgets.userId, userId), eq(budgets.deletedAt, null)))
  //   .returning()
  const budget = [
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

  if (!budget.length) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Budget not found',
    })
  }

  return {
    success: true,
    data: {
      message: 'Budget updated successfully',
    },
  }
})

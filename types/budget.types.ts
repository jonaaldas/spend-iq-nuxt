export interface Budget {
  id: string
  name: string
  amount: number
  category: string
  duration: 'Monthly' | 'Weekly' | 'Yearly'
  userId: string
  createdAt: Date
  updatedAt: Date
  deletedAt: Date | null
}

export type BudgetCreateInput = Omit<Budget, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>

export type BudgetUpdateInput = Partial<BudgetCreateInput> & { id: string }

export interface BudgetResponse {
  success: boolean
  data: Budget | Budget[] | { message: string }
}

export interface DeleteBudgetRequest {
  id: string
}

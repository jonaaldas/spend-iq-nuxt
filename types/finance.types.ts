export interface Payment {
  id: string
  amount: number
  status: 'pending' | 'processing' | 'success' | 'failed'
  email: string
}

export interface FinanceAccount {
  id: string
  name: string
  type: string
  institution_id: string
  balances: {
    available: number
    current: number
    limit?: number
  }
}

export interface Institution {
  id: string
  name: string
  logo?: string
}

export interface PersonalFinanceCategory {
  primary: string
}

export interface Transaction extends Payment {
  personal_finance_category?: PersonalFinanceCategory
  amount: number
}

export interface FinanceData {
  transactions: Transaction[]
  accounts: FinanceAccount[]
  institutions: Institution[]
}

export interface FinanceResponse {
  success: boolean
  data: FinanceData
}

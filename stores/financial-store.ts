import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

interface Transaction {
  transaction_id: string
  date: string
  merchant_name?: string
  name: string
  amount: number
  pending: boolean
  account_id: string
  logo_url?: string
  personal_finance_category?: {
    detailed: string
    icon_url?: string
  }
}

interface Account {
  account_id: string
  name: string
  type: string
  subtype: string
  balances: {
    available: number
    current: number
    iso_currency_code: string
  }
}

interface FinancialData {
  transactions: Transaction[]
  accounts: Account[]
}

export const useFinancialStore = defineStore('financial', () => {
  const transactions = ref<Transaction[]>([])
  const accounts = ref<Account[]>([])
  const financialData = ref<FinancialData>({
    transactions: [],
    accounts: [],
  })
  const isLoading = ref(false)
  const loadingPlaid = ref(false)
  const firstConnection = ref(true)
  const error = ref<string | null>(null)

  // Getters
  const totalBalance = computed(() => {
    return accounts.value.reduce((total, account) => total + (account.balances.current || 0), 0)
  })

  const sortedTransactions = computed(() => {
    return [...transactions.value].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  })

  // Actions
  async function fetchTransactions() {
    isLoading.value = true
    error.value = null
    loadingPlaid.value = true

    try {
      const res = await $fetch<{
        success: boolean
        transactions: Transaction[]
        accounts: Account[]
      }>('/api/plaid/transactions')

      if (res.success) {
        financialData.value = res
      }
      loadingPlaid.value = false
      firstConnection.value = false
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch transactions'
      console.error('Error fetching transactions:', err)
    } finally {
      isLoading.value = false
      loadingPlaid.value = false
    }
  }

  function clearTransactions() {
    transactions.value = []
    accounts.value = []
  }

  return {
    // State
    financialData,
    isLoading,
    error,
    loadingPlaid,
    firstConnection,
    // Getters
    totalBalance,
    sortedTransactions,
    // Actions
    fetchTransactions,
    clearTransactions,
  }
})

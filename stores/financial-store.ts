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
  // Use useState for SSR-friendly state that persists across page loads
  const financialData = useState<FinancialData>('financial-data', () => ({
    transactions: [],
    accounts: [],
  }))
  const isLoading = useState<boolean>('financial-loading', () => true)
  const lastFetched = useState<number>('financial-last-fetched', () => 0)

  // Actions
  async function fetchTransactions(force = false) {
    try {
      // Check if we have cached data and it's less than 5 minutes old
      const now = Date.now()
      const fiveMinutes = 5 * 60 * 1000

      if (
        !force &&
        financialData.value.accounts.length > 0 &&
        now - lastFetched.value < fiveMinutes
      ) {
        isLoading.value = false
        return financialData.value
      }

      isLoading.value = true
      const res = await $fetch<{
        success: boolean
        transactions: Transaction[]
        accounts: Account[]
      }>('/api/plaid/transactions')

      if (res.success && res.accounts.length > 0) {
        financialData.value = res
        lastFetched.value = now
        return res
      }

      return {
        success: false,
        transactions: [],
        accounts: [],
      }
    } catch (err) {
      console.error('Error fetching transactions:', err)
      return {
        success: false,
        transactions: [],
        accounts: [],
      }
    } finally {
      isLoading.value = false
    }
  }

  function clearTransactions() {
    financialData.value = {
      transactions: [],
      accounts: [],
    }
    lastFetched.value = 0
  }

  // New method to handle account disconnection
  async function handleAccountDisconnected() {
    // Force refresh data to get updated account list
    await fetchTransactions(true)
  }

  return {
    // State
    financialData,
    isLoading,
    lastFetched,
    // Actions
    fetchTransactions,
    clearTransactions,
    handleAccountDisconnected,
  }
})

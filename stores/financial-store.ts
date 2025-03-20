import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Transaction {
  account_id: string
  amount: number
  iso_currency_code: string
  category: string[]
  category_id: string
  date: string
  authorized_date: string | null
  location: {
    address: string | null
    city: string | null
    region: string | null
    postal_code: string | null
    country: string | null
  }
  merchant_name: string | null
  name: string
  payment_channel: string
  pending: boolean
  personal_finance_category: {
    detailed: string
    primary: string
    icon_url?: string
  }
  transaction_id: string
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
  // Replace useState with ref for Pinia-managed state
  const financialData = ref<FinancialData>({
    transactions: [],
    accounts: [],
  })
  const isLoading = ref(true)
  const lastFetched = ref(0)

  // Add a flag to prevent multiple simultaneous fetches
  const isFetching = ref(false)

  // Actions
  async function fetchTransactions(force = false) {
    try {
      // Check if we're already fetching
      if (isFetching.value) {
        return financialData.value
      }

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

      isFetching.value = true
      isLoading.value = true

      const res = await $fetch<{
        success: boolean
        transactions: Transaction[]
        accounts: Account[]
      }>('/api/plaid/transactions')

      if (res.success && res.accounts.length > 0) {
        // Clone data before assigning to break reactive chain
        const transactions = [...res.transactions]
        const accounts = [...res.accounts]

        // Update state in a single operation
        financialData.value = {
          transactions,
          accounts,
        }
        lastFetched.value = now
        return { transactions, accounts }
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
      isFetching.value = false
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

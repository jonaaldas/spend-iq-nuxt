import type { FinanceData, FinanceResponse, Transaction } from '~/types/finance.types'

export const useFinanceStore = defineStore('finance', () => {
  const data = ref<FinanceData>({ transactions: [], accounts: [], institutions: [] })
  const loading = ref(false)

  async function getData(): Promise<FinanceData> {
    const response = await $fetch<FinanceResponse>('/api/plaid/data')
    data.value = response.success
      ? response.data
      : { transactions: [], accounts: [], institutions: [] }
    return data.value
  }

  async function refresh() {
    loading.value = true
    const { success } = await $fetch<{ success: boolean }>('/api/plaid/refresh', {
      method: 'POST',
    })
    if (success) {
      const response = await $fetch<FinanceResponse>('/api/plaid/data')
      data.value = response.success
        ? response.data
        : { transactions: [], accounts: [], institutions: [] }
    }
    loading.value = false
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  const categoryData = computed(() => {
    if (!data.value.transactions?.length) return []

    const categoryMap = new Map<string, number>()

    data.value.transactions.forEach((transaction: Transaction) => {
      if (transaction.personal_finance_category?.primary) {
        const category = transaction.personal_finance_category.primary
        const amount = Math.abs(transaction.amount)

        if (categoryMap.has(category)) {
          categoryMap.set(category, categoryMap.get(category)! + amount)
        } else {
          categoryMap.set(category, amount)
        }
      }
    })

    const result = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, total: Number(value) }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8)

    return result
  })

  const total = computed(() => {
    if (!data.value.accounts?.length) return 0
    return data.value.accounts.reduce((acc: number, curr) => acc + curr.balances.available, 0)
  })

  return { data, loading, refresh, categoryData, total, getData, formatCurrency }
})

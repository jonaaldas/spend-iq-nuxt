<template>
  <div v-if="isLoading" class="flex flex-col gap-8 w-full">
    <div class="flex flex-col gap-4">
      <Skeleton class="h-8 w-48" />
      <div class="flex flex-col gap-2">
        <Skeleton class="h-12 w-full" />
        <Skeleton class="h-12 w-full" />
        <Skeleton class="h-12 w-full" />
      </div>
    </div>
    <div class="flex flex-col gap-4">
      <Skeleton class="h-8 w-48" />
      <div class="flex flex-col gap-2">
        <Skeleton class="h-12 w-full" />
        <Skeleton class="h-12 w-full" />
        <Skeleton class="h-12 w-full" />
        <Skeleton class="h-12 w-full" />
        <Skeleton class="h-12 w-full" />
      </div>
    </div>
  </div>

  <div v-else class="w-full">
    <div
      v-if="financialData.accounts.length == 0"
      class="flex flex-col gap-4 items-center justify-center min-h-[50vh] w-full"
    >
      <div class="text-center mb-8">
        <h2 class="text-2xl font-semibold mb-2">Connect Your Bank Account</h2>
        <p class="text-muted-foreground">Link your bank account to start tracking your expenses</p>
      </div>
      <PlaidButton />
    </div>
    <div v-else class="flex w-full gap-6">
      <div class="flex flex-col w-full justify-between items-center gap-6">
        <div class="flex flex-row justify-between items-center w-full">
          <span class="text-sm text-muted-foreground">Press CMD + K to ask questions</span>
          <PlaidButton />
        </div>
        <Card class="w-full">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-row w-full">
              <div class="w-2/5 flex items-center justify-center h-[300px]">
                <Donut
                  :data="categoryData"
                  category="value"
                  index="name"
                  :value-formatter="formatCurrency"
                />
              </div>
              <div class="w-full space-y-4 pl-6">
                <div class="flex flex-col gap-4">
                  <p class="text-sm text-muted-foreground">
                    Distribution of your spending across different categories
                  </p>
                  <div class="space-y-3 mt-2">
                    <h3 class="text-sm font-medium">Top Categories</h3>
                    <div
                      v-for="category in categoryData.slice(0, 5)"
                      :key="category.name"
                      class="flex items-center justify-between"
                    >
                      <div class="space-y-1">
                        <p class="text-sm font-medium leading-none">{{ category.name }}</p>
                      </div>
                      <div class="font-medium">{{ formatCurrency(category.value) }}</div>
                    </div>
                  </div>
                  <div class="pt-4 mt-4 border-t">
                    <div class="flex items-center justify-between">
                      <div class="space-y-1">
                        <p class="text-sm font-medium leading-none">Total Balance</p>
                        <p class="text-sm text-muted-foreground">Available across all accounts</p>
                      </div>
                      <div class="font-medium">{{ formatCurrency(totalBalance) }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <DataTable class="w-full" :columns="columnsTable" :data="financialData.transactions" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

useHead({
  script: [
    {
      src: 'https://cdn.plaid.com/link/v2/stable/link-initialize.js',
      defer: true,
    },
  ],
})

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useFinancialStore } from '@/stores/financial-store'
import { ArrowUpDown, ChevronDown } from 'lucide-vue-next'
import DataTable from '@/components/dataTable/datatable.vue'

const financialStore = useFinancialStore()
const { financialData, isLoading } = storeToRefs(financialStore)
const columnsTable = ref<any[]>([])

const totalBalance = computed(() => {
  if (!financialData.value?.accounts?.length) return 0
  return financialData.value.accounts.reduce((total, account) => {
    return total + (account.balances.current || 0)
  }, 0)
})

const pendingTransactions = computed(() => {
  if (!financialData.value?.transactions?.length) return 0
  return financialData.value.transactions
    .filter(t => t.pending)
    .reduce((total, t) => total + Math.abs(t.amount), 0)
})

const totalSpent = computed(() => {
  if (!financialData.value?.transactions?.length) return 0
  return financialData.value.transactions
    .filter(t => !t.pending && t.amount > 0)
    .reduce((total, t) => total + t.amount, 0)
})

const categoryData = computed(() => {
  if (!financialData.value?.transactions?.length) return []

  const categoryMap = new Map<string, number>()

  financialData.value.transactions.forEach(transaction => {
    if (transaction.personal_finance_category?.detailed) {
      const category = transaction.personal_finance_category.detailed
      const amount = Math.abs(transaction.amount)

      if (categoryMap.has(category)) {
        categoryMap.set(category, categoryMap.get(category)! + amount)
      } else {
        categoryMap.set(category, amount)
      }
    }
  })

  // Convert map to array and sort by value (descending)
  const result = Array.from(categoryMap.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)

  // Take top 8 categories and group the rest as "Other"
  if (result.length > 8) {
    const topCategories = result.slice(0, 7)
    const otherCategories = result.slice(7)
    const otherSum = otherCategories.reduce((sum, cat) => sum + cat.value, 0)

    return [...topCategories, { name: 'Other', value: otherSum }]
  }

  return result
})

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const handleClick = async () => {
  const data = await $fetch('/api/plaid/create-link-token', {
    method: 'POST',
  })

  const config = {
    token: data.link_token,
    onSuccess: async (public_token: string, metadata: any) => {
      const res = await $fetch<{ success: boolean }>('/api/plaid/set-access-token', {
        method: 'POST',
        body: { public_token },
      })
      if (res.success) {
        console.log('Successfully set access token')
        await financialStore.fetchTransactions()
      } else {
        console.error('Failed to set access token')
      }
    },
  }

  const handler = window.Plaid.create(config)
  handler.open()
}

const generateColumns = () => {
  const columns = localStorage.getItem('columns')
  if (columns) {
    columnsTable.value = JSON.parse(columns)
    return
  }

  const columnKeys = [
    'name',
    'amount',
    'logo_url',
    'authorized_date',
    'category',
    'date',
    'iso_currency_code',
    'location',
    'transaction_type',
    'location',
    'merchant_name',
    'payment_channel',
    'pending',
  ]

  columnsTable.value = columnKeys.map((key: string) => {
    if (key == 'logo_url') {
      return {
        accessorKey: key,
        header: () => h('div', { class: 'text-center' }, key),
        cell: ({ row }: { row: any }) => {
          const value = row.getValue(key)
          if (value == null) return h('div', { class: 'text-center font-medium' }, 'N/A')
          return h('img', {
            src: value,
            class: 'w-10 h-10 rounded-full',
          })
        },
      }
    } else {
      return {
        accessorKey: key,
        header: ({ column }: { column: any }) =>
          h(
            Button,
            {
              variant: 'ghost',
              onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
            },
            () => [key, h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
          ),
        cell: ({ row }: { row: any }) => {
          const value = row.getValue(key)
          if (typeof value == 'number') {
            if (value > 0) {
              return h(
                'div',
                { class: 'text-center font-medium text-green-500' },
                formatCurrency(value)
              )
            } else {
              return h(
                'div',
                { class: 'text-center font-medium text-red-500' },
                formatCurrency(value)
              )
            }
          }
          return h('div', { class: 'text-center font-medium' }, value)
        },
      }
    }
  })
  // store columns in local storage
  localStorage.setItem('columns', JSON.stringify(columnsTable.value))
}

onMounted(async () => {
  try {
    generateColumns()
  } catch (error) {
    console.error('Error fetching transactions:', error)
  }
})
</script>

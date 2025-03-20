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
    <div v-else class="flex flex-col w-full gap-6">
      <div class="flex flex-col w-full justify-between items-start gap-6">
        <div class="flex flex-row justify-between items-center w-full">
          <span class="text-xs sm:text-sm text-muted-foreground"
            >Press CMD + K to ask questions</span
          >
          <PlaidButton />
        </div>
        <Card class="w-full">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div class="flex flex-col sm:flex-row w-full">
              <div class="w-full sm:w-2/5 flex items-center justify-center h-[250px] sm:h-[300px]">
                <DonutChart
                  v-if="categoryData.length > 0"
                  index="name"
                  :category="'total'"
                  :data="categoryData"
                  :value-formatter="formatCurrency"
                />
              </div>
              <div class="w-full space-y-4 pt-4 sm:pt-0 sm:pl-6">
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
                        <p class="text-sm font-medium leading-none">
                          {{ category.name }}
                        </p>
                      </div>
                      <div class="font-medium">{{ formatCurrency(category.total) }}</div>
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
        <div class="w-full overflow-x-auto">
          <DataTable class="w-full" :columns="columnsTable" :data="financialData.transactions" />
        </div>
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
import DonutChart from '@/components/ui/chart-donut/DonutChart.vue'
import { ref, computed, onMounted, h, type VNode } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'

const financialStore = useFinancialStore()
const { financialData, isLoading } = storeToRefs(financialStore)
const columnsTable = ref<ColumnDef<any, any>[]>([])
const isChartReady = ref(false)

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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const generateColumns = () => {
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
    'merchant_name',
    'payment_channel',
    'pending',
  ]

  columnsTable.value = columnKeys.map((key: string) => ({
    id: key,
    accessorKey: key,
    header: ({ column }) => {
      return h(
        Button,
        {
          variant: 'ghost',
          onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
        },
        () => [h('span', {}, key), h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })]
      )
    },
    cell: ({ row }) => {
      const value = row.getValue(key)
      if (key === 'logo_url') {
        if (!value) return h('div', { class: 'text-center font-medium' }, 'N/A')
        return h('img', {
          src: value as string,
          class: 'w-10 h-10 rounded-full',
          alt: 'logo',
        })
      }
      if (typeof value === 'number') {
        return h(
          'div',
          {
            class:
              value > 0
                ? 'text-center font-medium text-green-500'
                : 'text-center font-medium text-red-500',
          },
          formatCurrency(value)
        )
      }
      if (typeof value === 'object' && value !== null) {
        return h('div', { class: 'text-center font-medium' }, JSON.stringify(value))
      }
      return h('div', { class: 'text-center font-medium' }, String(value))
    },
  }))
}

onMounted(() => {
  generateColumns()
})
</script>

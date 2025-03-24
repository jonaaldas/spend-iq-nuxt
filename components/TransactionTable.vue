<template>
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-8">Financial Overview</h1>

    <div class="mb-12">
      <h2 class="text-2xl font-semibold mb-4">Accounts</h2>
      <Tabs :default-value="accountTypes[0]" class="w-full">
        <TabsList class="">
          <TabsTrigger v-for="type in accountTypes" :key="type" :value="type" class="capitalize">
            {{ type }}
          </TabsTrigger>
        </TabsList>
        <TabsContent v-for="type in accountTypes" :key="type" :value="type">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subtype</TableHead>
                <TableHead class="text-right">Available</TableHead>
                <TableHead class="text-right">Current Balance</TableHead>
                <TableHead>Currency</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="account in filteredAccounts(type)" :key="account.account_id">
                <TableCell>{{ account.name }}</TableCell>
                <TableCell class="capitalize">{{ account.type }}</TableCell>
                <TableCell class="capitalize">{{ account.subtype }}</TableCell>
                <TableCell class="text-right">{{
                  formatCurrency(account.balances.available)
                }}</TableCell>
                <TableCell class="text-right">{{
                  formatCurrency(account.balances.current)
                }}</TableCell>
                <TableCell>{{ account.balances.iso_currency_code }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TabsContent>
      </Tabs>
    </div>

    <!-- Transactions Table -->
    <div>
      <h2 class="text-2xl font-semibold mb-4">Recent Transactions</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead class="text-right">Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Account</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow
            v-for="transaction in transactions.transactions"
            :key="transaction.transaction_id"
          >
            <TableCell>{{ formatDate(transaction.date) }}</TableCell>
            <TableCell>
              <div class="flex items-center gap-2">
                <img
                  v-if="transaction.logo_url"
                  :src="transaction.logo_url"
                  :alt="transaction.merchant_name || transaction.name"
                  class="w-6 h-6 rounded"
                />
                {{ transaction.merchant_name || transaction.name }}
              </div>
            </TableCell>
            <TableCell>
              <div v-if="transaction.personal_finance_category" class="flex items-center gap-2">
                <img
                  v-if="transaction.personal_finance_category_icon_url"
                  :src="transaction.personal_finance_category_icon_url"
                  :alt="transaction.personal_finance_category.detailed || 'Category'"
                  class="w-4 h-4"
                />
                {{ transaction.personal_finance_category.detailed || 'Uncategorized' }}
              </div>
              <div v-else>Uncategorized</div>
            </TableCell>
            <TableCell
              class="text-right"
              :class="transaction.amount < 0 ? 'text-red-500' : 'text-green-500'"
            >
              {{ formatCurrency(transaction.amount) }}
            </TableCell>
            <TableCell>
              <Badge>
                {{ transaction.pending ? 'Pending' : 'Completed' }}
              </Badge>
            </TableCell>
            <TableCell>{{ transaction.account_id }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Root } from './types.ts'
const props = defineProps<{
  transactions: Root
}>()

// Helper function to format currency
const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined) return '-'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Helper function to format date
const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const accountTypes = computed(() => {
  console.log(props.transactions)
  const types = new Set(props.transactions.accounts.map(account => account.type))
  return Array.from(types)
})

const filteredAccounts = (type: string) => {
  return props.transactions.accounts.filter(account => account.type === type)
}
</script>

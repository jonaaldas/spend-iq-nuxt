<template>
  <div class="flex flex-col gap-4 container mx-auto max-w-screen-xl">
    <div class="flex justify-between">
      <div>
        <div class="prose">
          <h3>Overview</h3>
          <small>This is where you can see your financial data at a glance.</small>
        </div>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" @click="refresh" :disabled="loading">
          <RefreshCcw v-if="!loading" class="w-4 h-4" />
          <Loader2 v-else class="w-4 h-4 animate-spin" />
          Refresh
        </Button>
        <PlaidButton />
      </div>
    </div>
    <div class="flex flex-row gap-6">
      <DonutChart
        class="w-2/5"
        v-if="categoryData.length > 0"
        index="name"
        :category="'total'"
        :data="categoryData"
        :value-formatter="formatCurrency"
      />
      <div class="w-3/5 flex flex-col gap-4">
        <div
          v-for="item in categoryData"
          :key="item.name"
          class="flex flex-row justify-between gap-6"
        >
          <div>{{ item.name.charAt(0).toUpperCase() + item.name.toLowerCase().slice(1) }}</div>
          <div>{{ formatCurrency(item.total) }}</div>
        </div>
        <div class="flex flex-row justify-between gap-6">
          <div>Total Balance</div>
          <div class="font-bold" :class="[total > 0 ? 'text-green-500' : 'text-red-500']">
            {{ formatCurrency(total) }}
          </div>
        </div>
      </div>
    </div>
    <DataTable :columns="columns" :data="data.transactions" />
  </div>
</template>

<script setup lang="ts">
import type { Payment } from '~/components/table/column'
import { onMounted, ref } from 'vue'
import { columns } from '~/components/table/column'
import DataTable from '~/components/DataTable.vue'
import { Button } from '~/components/ui/button'
import { RefreshCcw, Loader2 } from 'lucide-vue-next'
import { DonutChart } from '~/components/ui/chart-donut'
const data = ref<
  | {
      transactions: Payment[]
      accounts: any[]
      institutions: any[]
    }
  | {
      success: boolean
      data: {
        transactions: Payment[]
        accounts: any[]
        institutions: any[]
      }
    }
>({ transactions: [], accounts: [], institutions: [] })
const loading = ref(false)
async function getData(): Promise<
  | {
      transactions: Payment[]
      accounts: any[]
      institutions: any[]
    }
  | {
      success: boolean
      data: {
        transactions: Payment[]
        accounts: any[]
        institutions: any[]
      }
    }
> {
  const { success, data } = await $fetch<{
    success: boolean
    data: {
      transactions: Payment[]
      accounts: any[]
      institutions: any[]
    }
  }>('/api/plaid/data')
  if (!success) {
    return { success: false, data: { transactions: [], accounts: [], institutions: [] } }
  }
  return data
}

async function refresh() {
  loading.value = true
  const { success } = await $fetch<{ success: boolean }>('/api/plaid/refresh', {
    method: 'POST',
  })
  if (success) {
    data.value = await getData()
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
  if (!data.value?.transactions?.length) return []

  const categoryMap = new Map<string, number>()

  data.value.transactions.forEach(transaction => {
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
  return data.value.accounts.reduce((acc, curr) => acc + curr.balances.available, 0)
})

onMounted(async () => {
  data.value = await getData()
})

definePageMeta({
  layout: 'dashboard',
})
</script>

<style scoped></style>

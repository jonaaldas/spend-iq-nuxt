<template>
  <div class="container flex flex-col max-w-screen-xl gap-4 mx-auto">
    <div class="flex justify-between">
      <div>
        <div class="prose">
          <h3>Overview</h3>
          <small>This is where you can see your financial data at a glance.</small>
        </div>
      </div>
      <div class="flex gap-2">
        <Button
          variant="outline"
          @click="refresh"
          :disabled="loading">
          <!-- <RefreshCcw v-if="!loading" class="w-4 h-4" />
          <Loader2 v-else class="w-4 h-4 animate-spin" /> -->
          Refresh
        </Button>
        <PlaidButton />
      </div>
    </div>
    <div v-if="!loading && data.transactions.length > 0">
      <div class="flex flex-row gap-6">
        <DonutChart
          class="w-2/5"
          v-if="categoryData.length > 0"
          index="name"
          :category="'total'"
          :data="categoryData"
          :value-formatter="formatCurrency" />
        <div class="flex flex-col w-3/5 gap-4">
          <div
            v-for="item in categoryData"
            :key="item.name"
            class="flex flex-row justify-between gap-6">
            <div>{{ item.name.charAt(0).toUpperCase() + item.name.toLowerCase().slice(1) }}</div>
            <div>{{ formatCurrency(item.total) }}</div>
          </div>
          <div class="flex flex-row justify-between gap-6">
            <div>Total Balance</div>
            <div
              class="font-bold"
              :class="[total > 0 ? 'text-green-500' : 'text-red-500']">
              {{ formatCurrency(total) }}
            </div>
          </div>
        </div>
      </div>
      <DataTable
        :columns="columns"
        :data="data.transactions" />
    </div>
    <div v-else>
      <div class="flex flex-col gap-4">
        <h3>No transactions found</h3>
        <p>Please connect your bank accounts to see your transactions.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { columns } from '~/components/table/column'
import DataTable from '~/components/DataTable.vue'
import { Button } from '~/components/ui/button'
// import { RefreshCcw, Loader2 } from 'lucide-vue-next'
import { DonutChart } from '~/components/ui/chart-donut'
import { useFinanceStore } from '~/store/finance-store'
const financeStore = useFinanceStore()
const { refresh, formatCurrency } = financeStore
const { data, loading, categoryData, total } = storeToRefs(financeStore)
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})
</script>

<style scoped></style>

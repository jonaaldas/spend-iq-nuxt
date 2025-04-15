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
          <!-- <RefreshCcw v-if="!loading" class="w-4 h-4" />
          <Loader2 v-else class="w-4 h-4 animate-spin" /> -->
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
import { columns } from '~/components/table/column'
import DataTable from '~/components/DataTable.vue'
import { Button } from '~/components/ui/button'
// import { RefreshCcw, Loader2 } from 'lucide-vue-next'
import { DonutChart } from '~/components/ui/chart-donut'
import { useFinanceStore } from '~/store/finance-store'
const financeStore = useFinanceStore()
const { refresh, formatCurrency } = financeStore
const { data, loading, categoryData, total } = storeToRefs(financeStore)
import { authClient } from '../../lib/auth-client'
definePageMeta({
  layout: 'dashboard',
})

onMounted(async () => {
  // const res = await authClient.api.createCheckoutSession({
  //   params: {
  //     slug: 'pro',
  //   },
  //   headers: await headers(),
  // })
  // console.log(res)
  // console.log(authClient.)
})
</script>

<style scoped></style>

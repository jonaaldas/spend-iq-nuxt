<template>
  <div class="flex flex-col gap-4 container mx-auto max-w-screen-xl">
    <div class="flex justify-between">
      <div>
        <div class="prose">
          <h3>Overview</h3>
          <small>This is where you can see your financial data at a glance.</small>
        </div>
      </div>
      <PlaidButton class="ml-auto" />
    </div>
    <DataTable :columns="columns" :data="data" />
  </div>
</template>

<script setup lang="ts">
import type { Payment } from '~/components/table/column'
import { onMounted, ref } from 'vue'
import { columns } from '~/components/table/column'
import DataTable from '~/components/DataTable.vue'

const data = ref<Payment[]>([])

async function getData(): Promise<Payment[]> {
  const { data } = await $fetch<{ success: boolean; data: { transactions: Payment[] } }>(
    '/api/plaid/data'
  )
  return data.transactions || []
}

onMounted(async () => {
  data.value = await getData()
})
definePageMeta({
  layout: 'dashboard',
})
</script>

<style scoped></style>

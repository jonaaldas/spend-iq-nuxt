<template>
  <div>
    <div v-if="isLoading" class="flex flex-col gap-8">
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

    <div
      v-else-if="firstConnection"
      class="flex flex-col gap-4 items-center justify-center min-h-[50vh]"
    >
      <div class="text-center mb-8">
        <h2 class="text-2xl font-semibold mb-2">Connect Your Bank Account</h2>
        <p class="text-muted-foreground">Link your bank account to start tracking your expenses</p>
      </div>
      <Button @click="handleClick" :disabled="loadingPlaid" size="lg">
        {{ loadingPlaid ? 'Connecting...' : 'Connect Bank Account' }}
      </Button>
    </div>

    <div v-else class="flex flex-col gap-4 w-full">
      <div class="flex justify-end">
        <Button @click="handleClick" size="sm">
          {{ loadingPlaid ? 'Connecting...' : 'Connect Another Bank Account' }}
        </Button>
      </div>
      <TransactionTable :transactions="transactions" />
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

const loadingPlaid = ref(false)
const isLoading = ref(true)
const transactions = ref<any>({})
const firstConnection = ref(true)

const handleClick = async () => {
  loadingPlaid.value = true
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
        await getTransactions()
      } else {
        console.error('Failed to set access token')
      }
    },
  }
  const handler = window.Plaid.create(config)
  handler.open()
  loadingPlaid.value = false
}

const getTransactions = async () => {
  const data = await $fetch<{ success: boolean; transactions: any[] }>('/api/plaid/transactions')
  transactions.value.push(...data.transactions)
}

onMounted(async () => {
  isLoading.value = true
  try {
    const res = await $fetch<{ success: boolean; transactions: any[] }>('/api/plaid/transactions')
    if (res.success) {
      transactions.value = res
      firstConnection.value = false
    }
  } catch (error) {
    console.error('Error fetching transactions:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

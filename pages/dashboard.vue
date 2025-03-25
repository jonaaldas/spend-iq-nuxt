<template>
  <div class="flex justify-center items-center h-screen">
    <Button @click="handleClick" :disabled="isLoading"> Connect <LucidePlus /> </Button>
    <Button @click="getPlaidTransactions" :disabled="isLoading">Get Transactions</Button>
    <pre>
      <code>{{ transactions }}</code>
    </pre>
  </div>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { LucidePlus } from 'lucide-vue-next'

useHead({
  script: [
    {
      src: 'https://cdn.plaid.com/link/v2/stable/link-initialize.js',
      defer: true,
    },
  ],
})

const isLoading = ref(false)
const handleClick = async () => {
  isLoading.value = true
  const response = await $fetch<{ success: boolean; data: { linkToken: string } }>(
    '/api/plaid/create-link-token',
    {
      method: 'POST',
    }
  )

  if (!response.success) {
    console.error('Failed to create link token')
    isLoading.value = false
    return
  }

  const config = {
    token: response.data.linkToken,
    onSuccess: async (public_token: string, metadata: any) => {
      const res = await $fetch<{ success: boolean }>('/api/plaid/set-access-token', {
        method: 'POST',
        body: { public_token },
      })
      isLoading.value = false
    },
  }

  const handler = window.Plaid.create(config)
  handler.open()
}

const transactions = ref({})

const getPlaidTransactions = async () => {
  const response = await $fetch<{
    success: boolean
    data: { transactions: any[]; accounts: any[]; institutions: any[] }
  }>('/api/plaid/data')
  if (!response.success) {
    console.error('Failed to get transactions')
    return
  }
  transactions.value = response.data
}
</script>

<style scoped></style>

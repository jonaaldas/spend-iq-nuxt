<template>
  <div>
    <Button @click="handleClick" :disabled="loadingPlaid">
      Connect {{ loadingPlaid ? '...' : '' }}
    </Button>
    <Button @click="getTransactions">Get Transactions</Button>
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

const loadingPlaid = ref(false)

const handleClick = async () => {
  loadingPlaid.value = true
  const data = await $fetch('/api/plaid/create-link-token', {
    method: 'POST',
  })
  const config = {
    token: data.link_token,
    onSuccess: async (public_token: string, metadata: any) => {
      const res = await $fetch('/api/plaid/set-access-token', {
        method: 'POST',
        body: { public_token },
      })
      console.log(res)
    },
  }
  const handler = window.Plaid.create(config)
  handler.open()
  loadingPlaid.value = false
}

const getTransactions = async () => {
  const data = await $fetch('/api/plaid/get-transactions')
  console.log(data)
}
</script>

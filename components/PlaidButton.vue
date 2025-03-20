<template>
  <div>
    <Button @click="handleClick" :disabled="isLoading"> Connect <LucidePlus /> </Button>
  </div>
</template>

<script setup lang="ts">
import { useFinancialStore } from '~/stores/financial-store'
import { Button } from '~/components/ui/button'
import { LucidePlus } from 'lucide-vue-next'
const financialStore = useFinancialStore()
const { isLoading, financialData } = storeToRefs(financialStore)

useHead({
  script: [
    {
      src: 'https://cdn.plaid.com/link/v2/stable/link-initialize.js',
      defer: true,
    },
  ],
})
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
</script>

<style scoped></style>

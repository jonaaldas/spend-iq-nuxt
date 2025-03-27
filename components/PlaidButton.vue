<template>
  <Button :class="cn(props.class)" :disabled="isLoading" @click="handleClick">
    <span :class="{ 'opacity-0': isLoading }">
      <LucidePlus class="w-5 h-5" />
    </span>
    <span :class="{ 'opacity-0': isLoading }" class="m-2"> Connect Bank Account </span>

    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center">
      <svg
        class="animate-spin h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  </Button>
</template>

<script setup lang="ts">
import { Button } from '~/components/ui/button'
import { LucidePlus } from 'lucide-vue-next'
import { Toaster } from './ui/toast'
import { cn } from '@/lib/utils'
import type { HTMLAttributes } from 'vue'
import { useFinanceStore } from '~/store/finance-store'
const financeStore = useFinanceStore()
const { getData } = financeStore

declare global {
  interface Window {
    Plaid: {
      create: (config: any) => {
        open: () => void
      }
    }
  }
}

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()

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
      if (!res.success) {
        console.error('Failed to set access token')
        isLoading.value = false
        return
      }
      isLoading.value = false
      await getData()
    },
    onExit: (error: any, metadata: any) => {
      console.log('Exit')
      isLoading.value = false
    },
  }

  const handler = window.Plaid.create(config)
  handler.open()
}
</script>

<style scoped></style>

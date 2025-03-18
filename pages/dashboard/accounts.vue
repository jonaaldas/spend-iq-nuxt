<template>
  <div class="w-full space-y-6">
    <div class="flex items-center justify-between">
      <h1 class="text-xl sm:text-2xl font-semibold tracking-tight">Connected Accounts</h1>
    </div>

    <div v-if="pending" class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="i in 3" :key="i" class="p-6">
        <Skeleton class="h-4 w-32 mb-4" />
        <Skeleton class="h-8 w-48 mb-2" />
        <Skeleton class="h-4 w-24" />
      </Card>
    </div>

    <div v-else-if="error" class="rounded-lg border p-4">
      <p class="text-sm text-muted-foreground">Failed to load accounts. Please try again later.</p>
    </div>

    <div v-else-if="data?.accounts?.length === 0" class="rounded-lg border p-6 sm:p-8 text-center">
      <BuildingIcon class="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground/50" />
      <h2 class="mt-4 text-lg font-semibold">No accounts connected</h2>
      <p class="mt-2 text-sm text-muted-foreground">Connect your first bank to get started.</p>
      <PlaidButton class="mt-4" />
    </div>

    <div v-else class="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <Card v-for="account in data?.accounts" :key="account.account_id" class="relative">
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="max-w-[75%]">
              <CardTitle class="line-clamp-1">{{ account.name }}</CardTitle>
              <CardDescription>{{ account.institution.name }}</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger as="div">
                <Button variant="ghost" size="icon" class="h-8 w-8">
                  <MoreVerticalIcon class="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem @click="disconnectAccount(account)">
                  <LogOutIcon class="mr-2 h-4 w-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <div class="flex flex-col gap-1">
            <div class="text-xl sm:text-2xl font-bold">
              {{ formatCurrency(account.balances.current) }}
            </div>
            <p class="text-sm text-muted-foreground">
              {{ account.subtype === 'checking' ? 'Available' : 'Current' }} Balance
            </p>
          </div>
          <div class="mt-4 flex flex-wrap items-center gap-2">
            <Badge :variant="account.type === 'depository' ? 'default' : 'secondary'">
              {{ formatAccountType(account.type) }}
            </Badge>
            <Badge variant="outline">
              {{ formatAccountSubtype(account.subtype) }}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PlusIcon, BuildingIcon, MoreVerticalIcon, LogOutIcon } from 'lucide-vue-next'
import { useFinancialStore } from '@/stores/financial-store'

interface Account {
  account_id: string
  name: string
  type: string
  subtype: string
  balances: {
    current: number
    available?: number
  }
  institution: {
    name: string
    institution_id: string
  }
  item_id: string
}

interface AccountsResponse {
  success: boolean
  accounts: Account[]
}

definePageMeta({
  layout: 'dashboard',
})

const { data, pending, error } = await useFetch<AccountsResponse>('/api/plaid/accounts')
const financialStore = useFinancialStore()

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

const formatAccountType = (type: string) => {
  const types: Record<string, string> = {
    depository: 'Bank',
    credit: 'Credit',
    loan: 'Loan',
    investment: 'Investment',
    other: 'Other',
  }
  return types[type] || type
}

const formatAccountSubtype = (subtype: string) => {
  return subtype
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const disconnectAccount = async (account: Account) => {
  const { error: showError, success: showSuccess } = useToast()
  try {
    const res = await $fetch<{ success: boolean; message: string }>('/api/plaid/disconnect', {
      method: 'POST',
      body: { itemId: account.item_id },
    })

    if (res.success) {
      // Refresh both the accounts list and transactions data
      await refreshNuxtData('accounts')
      await financialStore.handleAccountDisconnected()
      showSuccess(`Successfully disconnected ${account.name}`)
    }
  } catch (err) {
    console.error('Error disconnecting account:', err)
    showError('Failed to disconnect account. Please try again.')
  }
}
</script>

<style scoped></style>

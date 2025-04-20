<template>
  <div class="p-6 space-y-6">
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Accounts</h1>
      <Button @click="refresh" :disabled="loading">
        <!-- <RefreshCcw v-if="!loading" class="w-4 h-4 mr-2" />
        <Loader2 v-else class="w-4 h-4 mr-2 animate-spin" /> -->
        Refresh
      </Button>
    </div>

    <div
      v-if="loading || !groupedAccounts.length"
      class="flex flex-col justify-center items-center min-h-[400px] text-center space-y-4"
    >
      <div v-if="loading" class="animate-spin">
        <svg
          class="w-12 h-12 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      </div>
      <div v-else class="space-y-4">
        <svg
          class="w-16 h-16 mx-auto text-muted-foreground"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
          />
        </svg>
        <div>
          <h3 class="text-lg font-semibold">No Accounts Connected</h3>
          <p class="text-sm text-muted-foreground mt-1">
            Connect your bank accounts to start tracking your finances
          </p>
        </div>
        <PlaidButton @click="handleAddAccount" variant="default" class="mt-4">
          Connect Account
        </PlaidButton>
      </div>
    </div>

    <div v-else class="grid gap-6">
      <!-- Group by institution -->
      <div v-for="institution in groupedAccounts" :key="institution.name" class="space-y-4">
        <h2 class="text-xl font-semibold">{{ institution.name }}</h2>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card v-for="account in institution.accounts" :key="account.id" class="relative">
            <DropdownMenu>
              <DropdownMenuTrigger
                class="absolute right-4 top-4 hover:bg-accent hover:text-accent-foreground h-8 w-8 inline-flex items-center justify-center rounded-md"
              >
                <!-- <MoreHorizontal class="w-4 h-4" /> -->
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem @click="handleDelete(account.id)" class="text-destructive">
                  <!-- <Trash class="w-4 h-4 mr-2" /> -->
                  Delete Account
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <CardHeader>
              <CardTitle>{{ account.name }}</CardTitle>
              <CardDescription>{{ account.type }}</CardDescription>
            </CardHeader>
            <CardContent>
              <div class="space-y-2">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-muted-foreground">Available Balance</span>
                  <span class="font-medium">{{ formatCurrency(account.balances.available) }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-muted-foreground">Current Balance</span>
                  <span class="font-medium">{{ formatCurrency(account.balances.current) }}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFinanceStore } from '~/store/finance-store'
import { Button } from '~~/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '~~/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '~~/components/ui/dropdown-menu'
// import { RefreshCcw, Loader2, MoreHorizontal, Trash } from 'lucide-vue-next'
import PlaidButton from '~/components/PlaidButton.vue'

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth',
})

const financeStore = useFinanceStore()
const { refresh, formatCurrency } = financeStore
const { data, loading } = storeToRefs(financeStore)

const groupedAccounts = computed(() => {
  const groups = data.value.accounts.reduce(
    (acc, account) => {
      const institution = data.value.accounts.find(i => i.institution_id === account.institution_id)
      const institutionName = institution?.name || 'Other'

      if (!acc[institutionName]) {
        acc[institutionName] = {
          name: institutionName,
          accounts: [],
        }
      }

      acc[institutionName].accounts.push(account)
      return acc
    },
    {} as Record<string, { name: string; accounts: typeof data.value.accounts }>
  )

  return Object.values(groups)
})

const handleDelete = async (accountId: string) => {
  // Implement delete logic here
  console.log('Delete account:', accountId)
}

const handleAddAccount = () => {
  // Implement your account connection logic here
  console.log('Add account clicked')
}
</script>

<style scoped></style>

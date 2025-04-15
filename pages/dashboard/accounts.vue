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

    <div v-if="loading" class="flex justify-center items-center min-h-[200px]">
      <!-- <Loader2 class="w-8 h-8 animate-spin" /> -->
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

definePageMeta({
  layout: 'dashboard',
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
</script>

<style scoped></style>

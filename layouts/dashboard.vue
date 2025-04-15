<script setup lang="ts">
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  type SidebarProps,
} from '~/components/ui/sidebar'
import { authClient } from '../lib/auth-client'
import { useFinanceStore } from '~/store/finance-store'
import { GalleryVerticalEnd } from 'lucide-vue-next'

const financeStore = useFinanceStore()
const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'floating',
})

const hasActiveSubscription = ref(false)
const filteredNavItems = ref([])
// This is sample data.
const data = {
  navMain: [
    {
      title: 'Home',
      url: '/dashboard/home',
      items: [],
    },
    // {
    //   title: 'Transactions',
    //   url: '/dashboard/transactions',
    //   items: [],
    // },
    {
      title: 'Accounts',
      url: '/dashboard/accounts',
      items: [],
    },
    {
      title: 'Settings',
      url: '/dashboard/settings',
      items: [],
    },
  ],
}

const logout = async () => {
  await authClient.signOut({
    fetchOptions: {
      onSuccess: () => {
        navigateTo('/login')
      },
      onError: () => {
        console.error('Error signing out')
      },
    },
  })
}

const checkActiveSubscription = async () => {
  const paymentInformation = await $fetch('/api/auth/state')
  hasActiveSubscription.value = paymentInformation.activeSubscriptions.length > 0
}

// [1,2,3].map
const filterNavItems = () => {
  const notAllowedIfNotActive = ['Home', 'Accounts']
  filteredNavItems.value = data.navMain.filter(item => {
    if (hasActiveSubscription.value) {
      return true
    }
    return !notAllowedIfNotActive.includes(item.title)
  })
}

onMounted(async () => {
  await checkActiveSubscription()
  filterNavItems()
  await financeStore.getData()
})
</script>

<template>
  <SidebarProvider>
    <Sidebar v-bind="props">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" as-child>
              <a href="#">
                <div
                  class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                >
                  <GalleryVerticalEnd class="size-4" />
                </div>
                <div class="flex flex-col gap-0.5 leading-none">
                  <span
                    class="font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 bg-clip-text text-transparent"
                    >SPEND IQ</span
                  >
                  <span class="text-xs text-muted-foreground">DEMO</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu class="gap-2">
            <SidebarMenuItem v-for="item in filteredNavItems" :key="item.title">
              <SidebarMenuButton as-child>
                <a :href="item.url" class="font-medium">
                  {{ item.title }}
                </a>
              </SidebarMenuButton>
              <SidebarMenuSub v-if="item.items.length">
                <SidebarMenuSubItem v-for="childItem in item.items" :key="childItem.title">
                  <SidebarMenuSubButton as-child :is-active="childItem.isActive">
                    <a :href="childItem.url">{{ childItem.title }}</a>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton as-child>
                <NuxtLink href="#" @click="logout">Logout</NuxtLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
    <main class="flex flex-col h-screen p-12 w-full">
      <slot></slot>
    </main>
  </SidebarProvider>
  <ChatBot />
</template>

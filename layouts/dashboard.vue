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
} from '@/components/ui/sidebar'

import ChatBot from '@/components/ChatBot.vue'
import { useFinancialStore } from '@/stores/financial-store'
const financialStore = useFinancialStore()

const props = withDefaults(defineProps<SidebarProps>(), {
  variant: 'floating',
})

interface NavItem {
  title: string
  url: string
  isActive?: boolean
  items: NavItem[]
  id: string
}

const data = {
  navMain: [
    {
      title: 'Home',
      url: '/dashboard/home',
      items: [],
      id: 'home_tab',
    },
    {
      title: 'Accounts',
      url: '/dashboard/accounts',
      items: [],
      id: 'accounts_tab',
    },
  ] as NavItem[],
}

onMounted(async () => {
  await callOnce('financialStore.fetchTransactions', () => {
    console.log('fetching transactions')
    financialStore.fetchTransactions()
  })
})
</script>

<template>
  <SignedOut>
    <div class="flex flex-col h-svh justify-center items-center">
      <SignIn />
    </div>
  </SignedOut>
  <SignedIn>
    <SidebarProvider class="gap-6">
      <Sidebar v-bind="props">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" as-child>
                <a href="#">
                  <div
                    class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
                  >
                    <!-- <GalleryVerticalEnd class="size-4" /> -->
                    SIQ
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
          <SidebarGroup class="h-svh">
            <SidebarMenu class="gap-2">
              <SidebarMenuItem v-for="item in data.navMain" :key="item.title">
                <SidebarMenuButton as-child>
                  <a :href="item.url" class="font-medium" :id="item.id">
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
            </SidebarMenu>
            <div class="ml-auto mt-auto flex gap-2">
              <UserButton />
              <!-- <ThemeToggle /> -->
            </div>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main class="mt-16 flex h-full w-full max-w-screen-lg mx-auto px-4">
        <slot></slot>
      </main>
      <ChatBot />
    </SidebarProvider>
  </SignedIn>
</template>

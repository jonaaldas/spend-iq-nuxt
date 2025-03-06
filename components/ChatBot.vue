<template>
  <div class="fixed bottom-4 right-4 z-50">
    <Sheet v-model:open="isOpen">
      <SheetTrigger asChild>
        <Button size="icon" class="rounded-full h-14 w-14 shadow-lg">
          <MessageCircle class="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" class="flex h-full w-[400px] sm:w-[540px] flex-col p-0">
        <div class="px-6 pt-6">
          <SheetHeader>
            <SheetTitle>AI Assistant</SheetTitle>
            <SheetDescription>Ask me anything about your finances!</SheetDescription>
          </SheetHeader>
        </div>

        <div class="flex-1 overflow-y-auto px-6 py-4"></div>

        <div class="border-t bg-background p-6">
          <div class="flex gap-2">
            <Textarea rows="1" placeholder="Type your message..." class="flex-1 resize-none" />
            <Button size="icon" @click="handleSubmit">
              <MessageCircle class="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  </div>
</template>

<script setup lang="ts">
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { MessageCircle } from 'lucide-vue-next'
import { useFinancialStore } from '@/stores/financial-store'

const financialStore = useFinancialStore()
const { financialData } = storeToRefs(financialStore)

const isOpen = ref(false)

const handleSubmit = async (e: Event) => {
  e.preventDefault()
  const res = await $fetch('/api/ai/analyze', {
    method: 'POST',
    body: {
      financialData: financialData.value,
    },
  })
  console.log(res)
}
</script>

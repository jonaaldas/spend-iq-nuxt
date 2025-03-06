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

        <div class="flex-1 overflow-y-auto px-6 py-4">
          <div v-for="m in messages" :key="m.id" class="whitespace-pre-wrap">
            {{ m.role === 'user' ? 'User: ' : 'AI: ' }}
            {{ m.content }}
          </div>
        </div>

        <div class="border-t bg-background p-6">
          <span v-if="apiError" class="text-red-500 mb-4">{{ apiError }}</span>
          <div class="flex gap-2">
            <Textarea
              v-model="input"
              rows="1"
              placeholder="Type your message..."
              class="flex-1 resize-none"
            />
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
import { useChat } from '@ai-sdk/vue'

const apiError = ref<string | undefined>(undefined)
const { messages, input, handleSubmit, error } = useChat({
  api: '/api/ai/analyze',
  onError: error => {
    try {
      apiError.value = JSON.parse(error.message).message
      apiError.value = apiError.value
    } catch (e) {
      apiError.value = 'There was an error please try again later'
    }
  },
})

const isOpen = ref(false)
</script>

<template>
  <div>
    <!-- Dialog -->
    <Dialog v-model:open="isOpen" class="z-50">
      <DialogContent
        class="sm:max-w-[750px] max-w-[95%] h-[90vh] sm:h-[85vh] gap-0 p-0 outline-none"
      >
        <div class="flex h-full w-full flex-col overflow-hidden">
          <div class="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
            <div
              v-if="messages.length === 0 "
              class="flex flex-col items-center justify-center py-6 sm:py-8"
            >
              <Bot
                class="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mb-4 sm:mb-6 animate-pulse"
              />
              <div class="text-center space-y-2">
                <h3 class="text-base sm:text-lg font-semibold">Financial Assistant</h3>
                <p class="text-xs sm:text-sm text-muted-foreground max-w-sm">
                  Ask me anything about your finances. I can help you analyze spending patterns,
                  track expenses, and provide insights.
                </p>
                <div class="pt-3 sm:pt-4">
                  <p class="text-xs text-muted-foreground">Try asking:</p>
                  <div class="mt-2 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-full text-xs sm:text-sm hover:bg-muted/50"
                      @click="setExample('What were my biggest expenses last month?')"
                    >
                      What were my biggest expenses last month?
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-full text-xs sm:text-sm hover:bg-muted/50"
                      @click="setExample('Show me my spending patterns')"
                    >
                      Show me my spending patterns this month
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-full text-xs sm:text-sm hover:bg-muted/50"
                      @click="setExample('How much did I spend on food?')"
                    >
                      How much did I spend on food?
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="space-y-4 sm:space-y-6">
              <div
                v-for="m in messages"
                :key="m.id"
                :class="[
                  'group flex gap-2 sm:gap-3',
                  m.role === 'user' ? 'justify-end' : 'justify-start items-start',
                ]"
              >
                <div
                  v-if="m.role !== 'user'"
                  class="h-7 w-7 sm:h-8 sm:w-8 rounded-lg border bg-background/80 p-1 shadow-sm"
                >
                  <Bot class="h-full w-full" />
                </div>
                <div
                  :class="[
                    'rounded-2xl px-3 py-2 sm:px-4 sm:py-3 max-w-[90%] sm:max-w-[85%] text-xs sm:text-sm leading-relaxed shadow-sm',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/30 dark:bg-muted/50 prose-message',
                  ]"
                >
                  <div class="message-content" v-html="formatMessage(m.content)"></div>
                </div>
              </div>

              <!-- Typing Indicator -->
              <div v-if="isLoading" class="flex gap-2 sm:gap-3 justify-start items-start">
                <div class="h-7 w-7 sm:h-8 sm:w-8 rounded-lg border bg-background/80 p-1 shadow-sm">
                  <Bot class="h-full w-full animate-pulse" />
                </div>
                <div
                  class="rounded-2xl px-3 py-2 sm:px-4 sm:py-3 bg-muted/30 dark:bg-muted/50 shadow-sm"
                >
                  <div class="flex gap-1 h-4 sm:h-5 items-center">
                    <span
                      class="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce"
                      style="animation-delay: 0ms"
                    ></span>
                    <span
                      class="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce"
                      style="animation-delay: 150ms"
                    ></span>
                    <span
                      class="w-1.5 h-1.5 bg-foreground/50 rounded-full animate-bounce"
                      style="animation-delay: 300ms"
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            class="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-3 sm:p-4"
          >
            <span v-if="apiError" class="text-destructive text-xs sm:text-sm mb-2 sm:mb-3 block">{{
              apiError
            }}</span>
            <div class="flex items-center gap-2 sm:gap-3">
              <div class="relative flex-1">
                <Textarea
                  v-model="input"
                  placeholder="Type your message..."
                  class="flex h-9 sm:h-11 w-full rounded-md bg-transparent px-3 py-1 sm:py-2 text-xs sm:text-sm outline-none border-[1px] focus-visible:ring-1 focus-visible:ring-ring pr-9 sm:pr-12"
                  @keydown.enter.prevent="handleSubmit"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  class="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 sm:h-9 sm:w-9 hover:bg-muted/50"
                  @click="handleSubmit"
                >
                  <Send class="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <!-- Floating Chat Button -->
    <Button
      @click="isOpen = true"
      size="icon"
      class="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 h-12 w-12 sm:h-14 sm:w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <div class="relative">
        <MessageSquare class="h-5 w-5 sm:h-6 sm:w-6" />
        <span
          v-if="messages.length > 0"
          class="absolute -right-1 -top-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-primary text-[8px] sm:text-[10px] text-primary-foreground"
        >
          {{ messages.length }}
        </span>
      </div>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogContent } from '~~/components/ui/dialog'
import { Button } from '~~/components/ui/button'
import { Send, Bot, MessageSquare } from 'lucide-vue-next'
import { useChat } from '@ai-sdk/vue'
import { Textarea } from '~~/components/ui/textarea'
import { micromark } from 'micromark'
const apiError = ref<string | undefined>(undefined)
const isLoading = ref(false)

const formatMessage = (content: string) => {
  return micromark(content)
}

const {
  messages,
  input,
  handleSubmit: originalHandleSubmit,
  error,
} = useChat({
  api: '/api/ai/analyze',
  onError: error => {
    try {
      apiError.value = JSON.parse(error.message).message
    } catch (e) {
      apiError.value = 'There was an error please try again later'
    }
    isLoading.value = false
  },
  onFinish: () => {
    isLoading.value = false
  },
})

const handleSubmit = async () => {
  if (!input.value.trim()) return
  isLoading.value = true
  await originalHandleSubmit()
}

const isOpen = ref(false)

const setExample = (text: string) => {
  input.value = text
  handleSubmit()
}

// Handle keyboard shortcut
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    isOpen.value = !isOpen.value
  }
}

onMounted(async () => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
.prose-message {
  @apply text-foreground/90;
}

.prose-message strong {
  @apply font-semibold text-foreground;
}

.prose-message pre {
  @apply bg-muted/50 p-2 sm:p-3 rounded-lg my-2 overflow-x-auto font-mono text-xs sm:text-sm;
}

.prose-message ul,
.prose-message ol {
  @apply my-2 space-y-1;
}

.prose-message li {
  @apply ml-4;
}

.prose-message table {
  @apply w-full border-collapse my-2;
}

.prose-message td,
.prose-message th {
  @apply border border-border p-1 sm:p-2 text-xs sm:text-sm;
}

.prose-message code {
  @apply bg-muted/50 px-1 py-0.5 rounded text-xs sm:text-sm font-mono;
}

.message-content h1,
.message-content h2,
.message-content h3,
.message-content h4 {
  @apply font-semibold text-foreground mt-3 sm:mt-4 mb-1 sm:mb-2;
}

.message-content h1 {
  @apply text-xl sm:text-2xl;
}

.message-content h2 {
  @apply text-lg sm:text-xl;
}

.message-content h3 {
  @apply text-base sm:text-lg;
}

.message-content p {
  @apply mb-1 sm:mb-2;
}

.message-content p:last-child {
  @apply mb-0;
}

@media (max-width: 640px) {
  .prose-message pre::-webkit-scrollbar {
    height: 4px;
  }

  .prose-message pre::-webkit-scrollbar-thumb {
    @apply bg-muted-foreground/30 rounded;
  }
}
</style>

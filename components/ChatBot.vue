<template>
  <div>
    <!-- Dialog -->
    <Dialog v-model:open="isOpen" class="z-50">
      <DialogContent class="max-w-[750px] gap-0 p-0 outline-none">
        <div class="flex h-[85vh] w-full flex-col overflow-hidden">
          <div class="flex-1 overflow-y-auto px-4 py-6">
            <div
              v-if="messages.length === 0"
              class="flex flex-col items-center justify-center py-8"
            >
              <Bot class="h-12 w-12 text-muted-foreground mb-6 animate-pulse" />
              <div class="text-center space-y-2">
                <h3 class="text-lg font-semibold">Financial Assistant</h3>
                <p class="text-sm text-muted-foreground max-w-sm">
                  Ask me anything about your finances. I can help you analyze spending patterns,
                  track expenses, and provide insights.
                </p>
                <div class="pt-4">
                  <p class="text-xs text-muted-foreground">Try asking:</p>
                  <div class="mt-2 flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-full hover:bg-muted/50"
                      @click="setExample('What were my biggest expenses last month?')"
                    >
                      What were my biggest expenses last month?
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-full hover:bg-muted/50"
                      @click="setExample('Show me my spending patterns')"
                    >
                      Show me my spending patterns
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      class="w-full hover:bg-muted/50"
                      @click="setExample('How much did I spend on food?')"
                    >
                      How much did I spend on food?
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="space-y-6">
              <div
                v-for="m in messages"
                :key="m.id"
                :class="[
                  'group flex gap-3',
                  m.role === 'user' ? 'justify-end' : 'justify-start items-start',
                ]"
              >
                <div
                  v-if="m.role !== 'user'"
                  class="h-8 w-8 rounded-lg border bg-background/80 p-1 shadow-sm"
                >
                  <Bot class="h-full w-full" />
                </div>
                <div
                  :class="[
                    'rounded-2xl px-4 py-3 max-w-[85%] text-sm leading-relaxed shadow-sm',
                    m.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted/30 dark:bg-muted/50 prose-message',
                  ]"
                >
                  <div
                    class="whitespace-pre-wrap message-content"
                    v-html="formatMessage(m.content)"
                  ></div>
                </div>
              </div>

              <!-- Typing Indicator -->
              <div v-if="isLoading" class="flex gap-3 justify-start items-start">
                <div class="h-8 w-8 rounded-lg border bg-background/80 p-1 shadow-sm">
                  <Bot class="h-full w-full animate-pulse" />
                </div>
                <div class="rounded-2xl px-4 py-3 bg-muted/30 dark:bg-muted/50 shadow-sm">
                  <div class="flex gap-1 h-5 items-center">
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
            class="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4"
          >
            <span v-if="apiError" class="text-destructive text-sm mb-3 block">{{ apiError }}</span>
            <div class="flex items-center gap-3">
              <div class="relative flex-1">
                <Textarea
                  v-model="input"
                  placeholder="Type your message..."
                  class="flex h-11 w-full rounded-md bg-transparent px-3 py-2 text-sm outline-none border-[1px] focus-visible:ring-1 focus-visible:ring-ring pr-12"
                  @keydown.enter.prevent="handleSubmit"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  class="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 hover:bg-muted/50"
                  @click="handleSubmit"
                >
                  <Send class="h-4 w-4" />
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
      class="fixed bottom-4 right-4 h-14 w-14 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <div class="relative">
        <MessageSquare class="h-6 w-6" />
        <span
          v-if="messages.length > 0"
          class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground"
        >
          {{ messages.length }}
        </span>
      </div>
    </Button>
  </div>
</template>

<script setup lang="ts">
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Send, Bot, MessageSquare } from 'lucide-vue-next'
import { useChat } from '@ai-sdk/vue'
import { Textarea } from '@/components/ui/textarea'
const apiError = ref<string | undefined>(undefined)
const isLoading = ref(false)

const formatMessage = (content: string) => {
  // Basic markdown-like formatting
  return (
    content
      // Code blocks
      .replace(
        /```([^`]+)```/g,
        '<pre class="bg-muted/50 p-3 rounded-lg my-2 overflow-x-auto">$1</pre>'
      )
      // Bold text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Lists
      .replace(/^\d+\.\s+(.+)$/gm, '<li class="list-decimal ml-4">$1</li>')
      // Math expressions
      .replace(/\\\[(.*?)\\\]/g, '<div class="text-center my-2">$1</div>')
      // Tables (if needed)
      .replace(
        /\|(.+)\|/g,
        '<div class="overflow-x-auto"><table class="min-w-full"><tr><td>$1</td></tr></table></div>'
      )
      // Line breaks
      .replace(/\n\n/g, '<br><br>')
  )
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

onMounted(() => {
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
  @apply bg-muted/50 p-3 rounded-lg my-2 overflow-x-auto font-mono text-sm;
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
  @apply border border-border p-2 text-sm;
}

.prose-message code {
  @apply bg-muted/50 px-1.5 py-0.5 rounded text-sm font-mono;
}

.message-content h1,
.message-content h2,
.message-content h3,
.message-content h4 {
  @apply font-semibold text-foreground mt-4 mb-2;
}

.message-content h1 {
  @apply text-2xl;
}

.message-content h2 {
  @apply text-xl;
}

.message-content h3 {
  @apply text-lg;
}

.message-content p {
  @apply mb-2;
}

.message-content p:last-child {
  @apply mb-0;
}
</style>

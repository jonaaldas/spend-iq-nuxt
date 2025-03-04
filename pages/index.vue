<template>
  <div class="min-h-screen bg-background text-foreground relative overflow-hidden">
    <div class="container relative z-10 mx-auto px-4 py-8 flex flex-col min-h-screen">
      <div class="flex justify-end w-full">
        <ThemeToggle />
      </div>

      <main class="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full py-12">
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold mb-3">
            Know where your money goes with
            <span
              class="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 bg-clip-text text-transparent"
            >
              SPEND IQ
            </span>
          </h1>
          <p class="text-muted-foreground text-lg md:text-xl mb-2">
            Join the waitlist for the next generation expense tracker
          </p>
          <p class="text-muted-foreground text-sm">
            <span class="inline-flex items-center">
              <Code class="h-4 w-4 mr-1" />
              Open source
            </span>
            <span class="mx-2">•</span>
            <span class="inline-flex items-center">
              <Server class="h-4 w-4 mr-1" />
              Self-host or use our cloud service
            </span>
          </p>
        </div>

        <div class="grid md:grid-cols-2 gap-8 w-full mb-10">
          <div class="space-y-6">
            <div class="space-y-4">
              <div v-for="(feature, i) in features" :key="i" class="flex items-center">
                <div class="mr-3 mt-0.5 bg-secondary p-2 rounded-full text-purple-400">
                  <component :is="feature.component" class="h-5 w-5" />
                </div>
                <p class="text-foreground">{{ feature.text }}</p>
              </div>
            </div>
          </div>

          <div class="bg-card p-6 rounded-xl border shadow-sm">
            <h3 class="text-xl font-semibold mb-4">Join the Waitlist</h3>
            <p class="text-muted-foreground mb-6">
              Be the first to know when we launch and get early access.
            </p>

            <form @submit.prevent="handleSubmit" class="space-y-4">
              <div class="relative">
                <User class="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  v-model="formData.name"
                  placeholder="Your name"
                  class="pl-10 h-12 w-full rounded-md border"
                  required
                />
              </div>

              <div class="relative">
                <Mail class="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  v-model="formData.email"
                  placeholder="Your email"
                  type="email"
                  class="pl-10 h-12 w-full rounded-md border"
                  required
                />
              </div>

              <button
                type="submit"
                :disabled="isSubmitting"
                class="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12 mt-2 group rounded-md flex items-center justify-center"
              >
                {{ isSubmitting ? 'Submitting...' : 'Join Waitlist' }}
                <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>

            <p class="text-muted-foreground text-sm mt-4 text-center">
              We respect your privacy. No spam, ever.
            </p>
          </div>
        </div>
      </main>

      <footer class="text-center text-muted-foreground text-sm pb-8">
        <div class="flex justify-center space-x-4 mb-2">
          <NuxtLink to="/terms" class="hover:text-foreground transition-colors">
            Terms of Service
          </NuxtLink>
          <NuxtLink to="/privacy" class="hover:text-foreground transition-colors">
            Privacy Policy
          </NuxtLink>
        </div>
        <p>© {{ currentYear }} SPEND IQ. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { WaitlistFormData, WaitlistFeature } from '@/types/waitlist.types'
import { useToast } from '@/composables/useToast'
import {
  User,
  Camera,
  Code,
  ArrowRight,
  Wallet,
  Bot,
  MessageSquare,
  Zap,
  Banknote,
  LineChart,
  Server,
} from 'lucide-vue-next'

const toast = useToast()
const currentYear = computed(() => new Date().getFullYear())

const formData = reactive<WaitlistFormData>({
  email: '',
  name: '',
})

const isSubmitting = ref(false)

const features: WaitlistFeature[] = [
  { component: Wallet, text: 'Connect all your bank accounts' },
  { component: Bot, text: 'Have AI categorize your transactions' },
  { component: MessageSquare, text: 'Get insights into your spending via Telegram' },
  { component: Zap, text: 'Use AI to ask questions about your spending' },
  { component: Banknote, text: 'Set budgets and goals' },
  { component: LineChart, text: "Get notified when you're about to exceed your budgets" },
  { component: Code, text: 'Completely open source - inspect, modify, or self-host' },
  { component: Server, text: 'Self-host for free or use our hosted service for a monthly fee' },
]

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    // Mock API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    toast.success('You are in the list')
    formData.email = ''
    formData.name = ''
  } catch (error) {
    toast.error('Something went wrong')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.bg-clip-text {
  -webkit-background-clip: text;
}
</style>

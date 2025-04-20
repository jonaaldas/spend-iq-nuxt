<template>
  <div class="min-h-screen bg-background text-foreground relative overflow-hidden">
    <div class="container relative z-10 mx-auto px-4 py-8 flex flex-col min-h-screen">
      <main class="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full py-12">
        <div class="text-center mb-8">
          <h1 class="text-4xl md:text-5xl font-bold mb-3">
            Use AI to ask questions about your spending
            <span class="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 bg-clip-text text-transparent"> SPEND IQ </span>
          </h1>
          <p class="text-muted-foreground text-lg md:text-xl mb-2">Join the waitlist for the next generation expense tracker</p>
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
              <div
                v-for="(item, i) in features"
                :key="i"
                class="flex items-center">
                <div class="mr-3 mt-0.5 bg-muted p-2 rounded-full text-primary">
                  <component
                    :is="item.icon"
                    class="h-5 w-5" />
                </div>
                <p class="text-muted-foreground">{{ item.text }}</p>
              </div>
            </div>
          </div>

          <!-- Here we will add a customer waitlist form -->
        </div>
      </main>

      <footer class="text-center text-muted-foreground text-sm pb-8">
        <div class="flex justify-center space-x-4 mb-2">
          <NuxtLink
            to="/terms"
            class="hover:text-foreground transition-colors">
            Terms of Service
          </NuxtLink>
          <NuxtLink
            to="/privacy"
            class="hover:text-foreground transition-colors">
            Privacy Policy
          </NuxtLink>
        </div>
        <p>© {{ new Date().getFullYear() }} SPEND IQ. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { BanknoteIcon, LineChart, MessageSquare, Wallet, Zap, Code, Server } from 'lucide-vue-next'

const features = [
  { icon: Wallet, text: 'Connect all your bank accounts' },
  { icon: MessageSquare, text: 'Get insights into your spending via Telegram' },
  { icon: Zap, text: 'Use AI to ask questions about your spending' },
  { icon: BanknoteIcon, text: 'Set budgets and goals' },
  { icon: LineChart, text: "Get notified when you're about to exceed your budgets" },
  { icon: Code, text: 'Completely open source - inspect, modify, or self-host' },
  { icon: Server, text: 'Self-host for free or use our hosted service for a monthly fee' },
]
</script>

<style>
/* Add any custom styles here */
</style>

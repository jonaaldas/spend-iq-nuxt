<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <h1 class="text-4xl font-bold text-gray-900 mb-4">Nothing to see here! 👀</h1>
      <Button @click="router.push('/dashboard/settings')">Go to Settings</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
definePageMeta({
  layout: 'dashboard',
})
const router = useRouter()
</script>

<style scoped></style>

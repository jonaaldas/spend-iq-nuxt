<template>
  <div>
    <NuxtLoadingIndicator :height="7" color="black" />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from '~~/components/ui/sonner'
</script>

<style></style>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { Toggle } from '@/components/ui/toggle'

const emit = defineEmits<{
  (e: 'toggle-theme', theme: string): string
}>()

const colorMode = useColorMode()

const handleToggle = () => {
  const newTheme = colorMode.preference === 'dark' ? 'light' : 'dark'
  colorMode.preference = newTheme
  emit('toggle-theme', newTheme)
}
</script>

<template>
  <Toggle @click="handleToggle" :pressed="colorMode.preference === 'dark'">
    <Icon
      icon="radix-icons:moon"
      class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
    />
    <Icon
      icon="radix-icons:sun"
      class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
    />
    <span class="sr-only">Toggle theme</span>
  </Toggle>
</template>

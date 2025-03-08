<template>
  <Button variant="ghost" size="icon" @click="toggleTheme" class="relative">
    <Sun
      v-if="!isDark"
      class="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
    />
    <Moon
      v-if="isDark"
      class="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
    />
    <span class="sr-only">Toggle theme</span>
  </Button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Sun, Moon } from 'lucide-vue-next'

const isDark = ref(false)

onMounted(() => {
  // Check initial theme
  isDark.value = document.documentElement.classList.contains('dark')
})

const emit = defineEmits<{
  (e: 'toggleTheme', isDark: boolean): boolean
}>()

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
    localStorage.setItem('theme', 'dark')
  } else {
    document.documentElement.classList.remove('dark')
    localStorage.setItem('theme', 'light')
  }
  emit('toggleTheme', isDark.value)
}
</script>

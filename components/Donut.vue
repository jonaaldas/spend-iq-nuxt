<script setup lang="ts">
import { DonutChart } from '@/components/ui/chart-donut'
const props = defineProps<{
  data: { name: string; value: number }[]
  valueFormatter: (value: number) => string
}>()
</script>

<template>
  <DonutChart
    index="name"
    :category="'value'"
    :data="data"
    :value-formatter="valueFormatter"
    :showTooltip="false"
  />
</template>

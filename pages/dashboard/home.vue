<template>
  <div class="flex justify-between">
    <div class="prose">
      <h3>Overview</h3>
      <small>This is where you can see your financial data at a glance.</small>
    </div>
    <PlaidButton class="ml-auto" />
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})
</script>

<style scoped></style>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-center">
      <div
        class="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"
      ></div>
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Please wait a moment</h2>
      <p class="text-gray-600">We are verifying your payment...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const route = useRoute()
const checkoutId = route.query.checkout_id

onMounted(() => {
  setTimeout(() => {
    router.push('/dashboard/settings')
  }, 3000)
})
</script>

<style scoped></style>

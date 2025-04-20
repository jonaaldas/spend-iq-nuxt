<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4">
    <Card class="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[500px]">
      <CardHeader>
        <CardTitle class="text-xl sm:text-2xl"> Reset Password </CardTitle>
        <CardDescription> Enter your new password below </CardDescription>
      </CardHeader>
      <CardContent>
        <form @submit.prevent="sendResetPassword" class="grid gap-4">
          <div class="grid gap-2">
            <Label for="new-password">Password</Label>
            <Input id="new-password" type="password" v-model="newPassword" required />
          </div>
          <div class="grid gap-2">
            <Label for="confirm-password">Confirm Password</Label>
            <Input id="confirm-password" type="password" v-model="confirmPassword" required />
            <p v-if="passwordNotMatch" class="text-sm text-red-500">Passwords do not match</p>
          </div>
          <Button
            type="submit"
            class="w-full"
            :disabled="passwordNotMatch || !newPassword || !confirmPassword"
          >
            Reset Password
          </Button>
        </form>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { authClient } from '../lib/auth-client'

const route = useRoute()
const token = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordNotMatch = ref(false)

const sendResetPassword = async () => {
  if (!token.value) {
    toast('Invalid Request', {
      description: 'Missing reset token. Please try again.',
    })
    return
  }

  const { error } = await authClient.resetPassword({
    newPassword: newPassword.value,
    token: token.value,
  })

  if (error) {
    toast('Error', {
      description: error.message,
    })
    return
  }

  toast('Password reset successfully', {
    description: 'You can now login with your new password',
  })
  // Redirect to login page after successful reset
  navigateTo('/login')
}

watch(
  [newPassword, confirmPassword],
  ([newVal, confirmVal]) => {
    passwordNotMatch.value = Boolean(newVal && confirmVal && newVal !== confirmVal)
  },
  { immediate: true }
)

onMounted(() => {
  token.value = route.query.token as string
  if (!token.value) {
    toast('Invalid Request', {
      description: 'Please try again',
    })
  }
})
</script>

<style scoped></style>

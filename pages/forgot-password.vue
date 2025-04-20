<script setup lang="ts">
import { Button } from '~~/components/ui/button'
import { Input } from '~~/components/ui/input'
import { Label } from '~~/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~~/components/ui/card'
import { authClient } from '../lib/auth-client'
import { toast } from 'vue-sonner'
const email = ref('')

const handleResetPassword = async () => {
  const { data, error } = await authClient.forgetPassword({
    email: email.value,
    redirectTo: '/reset-password',
  })
  if (error) {
    toast('There was an error resetting your password', {
      description: error.message,
    })
  }
  toast('Password reset email sent', {
    description: 'Check your email for a link to reset your password',
  })
}
</script>

<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <Card class="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle class="text-2xl"> Forgot Password </CardTitle>
        <CardDescription> Enter your email below to reset your password </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" type="email" v-model="email" placeholder="m@example.com" required />
          </div>
          <Button type="submit" class="w-full" @click="handleResetPassword">
            Reset Password
          </Button>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

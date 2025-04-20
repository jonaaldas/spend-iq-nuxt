<script setup lang="ts">
import { Button } from '~~/components/ui/button'
import { Spiner } from 'lucide-vue-next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~~/components/ui/card'
import { Input } from '~~/components/ui/input'
import { Label } from '~~/components/ui/label'
import { useRouter } from 'vue-router'
import { authClient } from '../lib/auth-client'
import { toast } from 'vue-sonner'

const router = useRouter()
const email = ref('')
const password = ref('')

const handleLogin = async () => {
  const { error } = await authClient.signIn.email({
    email: email.value,
    password: password.value,
  })
  if (error) {
    toast('There was an error logging in', {
      description: error.message,
    })
  }
  window.location.href = '/dashboard/home'
}
</script>
<template>
  <div class="flex flex-col items-center justify-center h-screen">
    <Card class="max-w-sm mx-auto">
      <CardHeader>
        <CardTitle class="text-2xl"> Login </CardTitle>
        <CardDescription> Enter your email below to login to your account </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="grid gap-4" @submit.prevent="handleLogin">
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input
              id="email"
              type="email"
              v-model="email"
              placeholder="m@example.com"
              required />
          </div>
          <div class="grid gap-2">
            <div class="flex items-center">
              <Label for="password">Password</Label>
              <a
                href="#"
                class="inline-block ml-auto text-sm underline">
                Forgot your password?
              </a>
            </div>
            <Input
              id="password"
              type="password"
              v-model="password"
              required />
          </div>
          <Button type="submit" class="w-full" @click="handleLogin"> Login </Button>
        </div>
        <div class="mt-4 text-sm text-center">
          Don't have an account?
          <a
            href="/register"
            class="underline">
            Register
          </a>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

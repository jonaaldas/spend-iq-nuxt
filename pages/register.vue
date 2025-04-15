<script setup lang="ts">
import { authClient } from '~/lib/auth-client'
import { Button } from '~~/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~~/components/ui/card'
import { Label } from '~~/components/ui/label'
import { Input } from '~~/components/ui/input'
import { toast } from 'vue-sonner'
import { useRouter } from 'vue-router'
const router = useRouter()

const email = ref('')
const password = ref('')
const first_name = ref('')
const last_name = ref('')

const signUp = async () => {
  const { error } = await authClient.signUp.email({
    email: email.value,
    password: password.value,
    name: `${first_name.value} ${last_name.value}`,
  })
  if (error) {
    toast('There was an error signing up', {
      description: error.message,
    })
  }
  router.push('/')
}
</script>

<template>
  <div class="flex justify-center items-center h-screen">
    <Card class="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle class="text-xl"> Sign Up </CardTitle>
        <CardDescription> Enter your information to create an account </CardDescription>
      </CardHeader>
      <CardContent>
        <div class="grid gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="grid gap-2">
              <Label for="first-name">First name</Label>
              <Input id="first-name" v-model="first_name" placeholder="Max" required />
            </div>
            <div class="grid gap-2">
              <Label for="last-name">Last name</Label>
              <Input id="last-name" v-model="last_name" placeholder="Robinson" required />
            </div>
          </div>
          <div class="grid gap-2">
            <Label for="email">Email</Label>
            <Input id="email" v-model="email" type="email" placeholder="m@example.com" required />
          </div>
          <div class="grid gap-2">
            <Label for="password">Password</Label>
            <Input id="password" v-model="password" type="password" />
          </div>
          <Button type="submit" class="w-full" @click="signUp"> Create an account </Button>
          <!-- <Button variant="outline" class="w-full"> Sign up with GitHub </Button> -->
        </div>
        <div class="mt-4 text-center text-sm">
          Already have an account?
          <a href="/login" class="underline"> Sign in </a>
        </div>
      </CardContent>
    </Card>
  </div>
</template>

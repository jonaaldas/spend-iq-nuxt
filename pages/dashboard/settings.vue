<template>
  <div class="container mx-auto py-8 px-4">
    <h1 class="text-3xl font-bold mb-8">Settings</h1>

    <div class="grid gap-6">
      <!-- Customer Info Card -->
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
          <CardDescription>Manage your personal information and account settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium">Name</label>
              <p class="text-lg">{{ userInformation?.data?.user?.name }}</p>
            </div>
            <div>
              <label class="text-sm font-medium">Email</label>
              <p class="text-lg">{{ userInformation?.data?.user?.email }}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" @mousedown="changePassword">Change Password</Button>
        </CardFooter>
      </Card>

      <!-- Pricing Card -->
      <Card
        v-if="
          paymentInformation?.activeSubscriptions?.length == 0 ||
          paymentInformation?.activeSubscriptions[0]?.status !== 'active'
        "
      >
        <CardHeader>
          <CardTitle>Pro Plan</CardTitle>
          <CardDescription>Get access to all premium features</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-2">
            <div class="text-2xl font-bold">$29/month</div>
            <ul class="space-y-2 list-disc list-inside text-sm">
              <li>Unlimited transactions</li>
              <li>Advanced analytics</li>
              <li>Priority support</li>
              <li>Custom reports</li>
              <li>Team collaboration</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter>
          <Button @mousedown="goToCheckout">Upgrade Now</Button>
        </CardFooter>
      </Card>

      <!-- Billing Information Card -->
      <Card v-if="paymentInformation?.activeSubscriptions?.length > 0">
        <CardHeader>
          <CardTitle>Billing Information</CardTitle>
          <CardDescription>View and manage your subscription details</CardDescription>
        </CardHeader>
        <CardContent>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-medium">Current Plan</label>
              <p class="text-lg">Pro Plan</p>
            </div>
            <div>
              <label class="text-sm font-medium">Billing Period</label>
              <p class="text-lg">
                {{ paymentInformation?.activeSubscriptions[0]?.recurringInterval }}
              </p>
            </div>
            <div>
              <label class="text-sm font-medium">Next Payment</label>
              <p class="text-lg">
                {{
                  new Date(
                    paymentInformation?.activeSubscriptions[0]?.currentPeriodEnd
                  ).toLocaleDateString()
                }}
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button @mousedown="goToAuthPortal">Manage Billing</Button>
        </CardFooter>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'dashboard',
})

import { authClient } from '~/lib/auth-client'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
const router = useRouter()
const userInformation = ref<any>(null)
const paymentInformation = ref<any>(null)

const changePassword = () => {
  router.push('/forgot-password')
}

const goToAuthPortal = () => {
  window.open('/api/auth/portal', '_blank')
}

const goToCheckout = () => {
  window.open('/api/auth/checkout?productId=af11d002-cb7a-4265-9e59-b43779f71342')
}

onMounted(async () => {
  const [user, payment] = await Promise.all([authClient.getSession(), $fetch('/api/auth/state')])
  userInformation.value = user
  paymentInformation.value = payment
})
</script>

<style scoped></style>

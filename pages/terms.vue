<template>
  <div class="min-h-screen bg-black relative overflow-hidden">
    <div class="container relative z-10 mx-auto px-4 py-8 flex flex-col min-h-screen">
      <header class="py-6">
        <div class="flex justify-between items-center">
          <NuxtLink
            to="/"
            class="text-2xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-600 bg-clip-text text-transparent"
          >
            SPEND IQ
          </NuxtLink>
          <NuxtLink to="/" class="text-zinc-300 hover:text-white transition-colors">
            Back to Home
          </NuxtLink>
        </div>
      </header>

      <main class="flex-1 py-12">
        <div class="max-w-4xl mx-auto">
          <h1 class="text-3xl md:text-4xl font-bold text-white mb-8">Terms of Service</h1>

          <div class="prose prose-invert max-w-none">
            <h2 class="text-xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
            <p class="text-zinc-300 mb-4">
              By accessing and using SPEND IQ services, you acknowledge that you have read,
              understood, and agree to be bound by these Terms of Service. If you do not agree with
              any part of these terms, you may not use our services.
            </p>

            <h2 class="text-xl font-semibold text-white mt-8 mb-4">2. Description of Service</h2>
            <p class="text-zinc-300 mb-4">
              SPEND IQ provides an expense tracking platform that allows users to connect bank
              accounts, categorize transactions, receive spending insights, set budgets, and receive
              notifications. The service may be modified, updated, or enhanced at any time without
              prior notice.
            </p>

            <h2 class="text-xl font-semibold text-white mt-8 mb-4">3. Open Source Project</h2>
            <p class="text-zinc-300 mb-4">
              SPEND IQ is an open source project. Users have two options for using the service:
            </p>
            <ul class="list-disc pl-6 text-zinc-300 space-y-2 mb-4">
              <li>
                <strong>Self-hosting:</strong> You may download, modify, and self-host the SPEND IQ
                software according to the terms of our open source license. In this case, you are
                responsible for your own data security, updates, and maintenance.
              </li>
              <li>
                <strong>Hosted service:</strong> You may choose to use our hosted service by paying
                a monthly fee. In this case, we provide hosting, maintenance, updates, and
                additional features that may not be available in the self-hosted version.
              </li>
            </ul>
            <p class="text-zinc-300 mb-4">
              The terms in this document apply to both the self-hosted and hosted versions of SPEND
              IQ, except where explicitly stated otherwise.
            </p>

            <h2 class="text-xl font-semibold text-white mt-8 mb-4">4. User Accounts</h2>
            <p class="text-zinc-300 mb-4">
              To use SPEND IQ services, you must create an account. You are responsible for
              maintaining the confidentiality of your account credentials and for all activities
              that occur under your account. You agree to provide accurate and complete information
              when creating your account.
            </p>

            <h2 class="text-xl font-semibold text-white mt-8 mb-4">5. Data Privacy</h2>
            <p class="text-zinc-300 mb-4">
              We take your privacy seriously. Please review our
              <NuxtLink to="/privacy" class="text-purple-400 hover:text-purple-300 underline">
                Privacy Policy
              </NuxtLink>
              to understand how we collect, use, and disclose your information.
            </p>

            <h2 class="text-xl font-semibold text-white mt-8 mb-4">6. Bank Connections</h2>
            <p class="text-zinc-300 mb-4">
              By connecting your bank accounts to SPEND IQ, you authorize us to access and retrieve
              your financial data. We use secure third-party services for this connection. You
              understand that we do not store your bank credentials.
            </p>

            <h2 class="text-xl font-semibold text-white mt-8 mb-4">7. Limitations of Liability</h2>
            <p class="text-zinc-300 mb-4">
              SPEND IQ is provided "as is" without warranties of any kind. We are not liable for any
              direct, indirect, incidental, special, or consequential damages that result from the
              use of, or inability to use, our services.
            </p>

            <h2 class="text-xl font-semibold text-white mt-8 mb-4">8. Modifications to Terms</h2>
            <p class="text-zinc-300 mb-4">
              We reserve the right to modify these Terms of Service at any time. We will notify
              users of any significant changes. Your continued use of SPEND IQ after such
              modifications constitutes your acceptance of the updated terms.
            </p>

            <h2 class="text-xl font-semibold text-white mt-8 mb-4">9. Termination</h2>
            <p class="text-zinc-300 mb-4">
              We reserve the right to terminate or suspend your account at our discretion, without
              notice, for conduct that we believe violates these Terms of Service or is harmful to
              other users, us, or third parties, or for any other reason.
            </p>

            <h2 class="text-xl font-semibold text-white mt-8 mb-4">10. Contact Information</h2>
            <p class="text-zinc-300 mb-4">
              If you have any questions about these Terms of Service, please contact us at
              support@spendiq.com.
            </p>
          </div>

          <p class="text-zinc-400 mt-12 text-sm">Last updated: {{ formattedDate }}</p>
        </div>
      </main>

      <footer class="text-center text-zinc-500 text-sm py-8">
        <div class="flex justify-center space-x-4">
          <NuxtLink to="/terms" class="hover:text-white transition-colors">
            Terms of Service
          </NuxtLink>
          <NuxtLink to="/privacy" class="hover:text-white transition-colors">
            Privacy Policy
          </NuxtLink>
        </div>
        <p class="mt-2">© {{ currentYear }} SPEND IQ. All rights reserved.</p>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
const currentYear = computed(() => new Date().getFullYear())
const formattedDate = computed(() => new Date().toLocaleDateString())
</script>

<style scoped>
.prose {
  max-width: none;
}
</style>

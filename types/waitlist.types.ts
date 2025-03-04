import type { Component } from 'vue'

export interface WaitlistFormData {
  email: string
  name: string
}

export interface WaitlistFeature {
  component: Component
  text: string
}

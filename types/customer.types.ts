export interface Subscription {
  id: string
  status: 'active' | 'inactive' | 'canceled'
  currentPeriodEnd: string
  plan: {
    name: string
    price: number
  }
}

export interface CustomerState {
  activeSubscriptions: Subscription[]
  customer: {
    id: string
    email: string
  }
}

export type User = {
  id: number
  first_name: string | null
  last_name: string | null
  email: string
  subscriptions: Subscription[]
  memberships: Membership[] | null
}

export type TransformedUser = User & {
  entitlements?: string[]
  hasMembership?: boolean
}

interface Membership {
  id: number
  type: string
  price: number
  durationInDays: number
  subscription: Subscription
  user_id: number
}

interface Subscription {
  id: number
  status: string
  plan: SubscriptionPlan
  startDate: Date
  endDate: Date
  customerId: string
  current_period_end: string
}

interface SubscriptionPlan {
  id: number
  interval: string
  product: SubscriptionProduct
  nickname: string
  type: string
}

interface SubscriptionProduct {
  name: string
  sites: Site[]
  entitlements: string[]
}

interface Site {
  id: number
}

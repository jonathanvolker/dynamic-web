export type PlanId = 'free' | 'initial' | 'professional'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'expired'

export type Plan = {
  id: PlanId
  name: string
  description: string
  features: string[]
  price: number
  currency: 'ARS'
  maxSites: number
  allowedBlocks: string[] | 'all'
  customDomain: boolean
}

export type Subscription = {
  id: string
  user_id: string
  plan_id: PlanId
  status: SubscriptionStatus
  starts_at: string
  current_period_ends_at: string
  grace_period_ends_at: string | null
  provider: 'manual' | 'mercadopago'
  currency: 'ARS'
  contracted_price: number
  external_customer_id: string | null
  external_subscription_id: string | null
  cancel_at_period_end: number
  created_at: string
  updated_at: string
}

export type Entitlements = {
  plan: Plan
  subscription: Subscription
  canEdit: boolean
  canPublish: boolean
  canCreateSite: boolean
  availableBlocks: Set<string>
  graceDaysRemaining: number
}

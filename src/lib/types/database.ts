export type EventType =
  | 'breakup'
  | 'divorce'
  | 'canceled_wedding'
  | 'fresh_start'
  | 'job_loss'
  | 'medical'
  | 'housing'
  | 'other'

export type PrivacyLevel = 'public' | 'link_only' | 'private'

export type ItemPriority = 'need' | 'want' | 'dream'

export type ItemStatus = 'available' | 'claimed' | 'partially_funded' | 'fulfilled'

export type ItemCategory =
  | 'the_basics'
  | 'kitchen_reset'
  | 'bedroom_glowup'
  | 'living_solo'
  | 'self_care'
  | 'wheels'
  | 'petty_fund'
  | 'fresh_start_fund'
  | 'treat_yoself'
  | 'pets'
  | 'tech'
  | 'other'

export type FundType =
  | 'moving'
  | 'deposit'
  | 'legal'
  | 'therapy'
  | 'pet'
  | 'travel'
  | 'petty'
  | 'custom'

export type ContributionStatus = 'pending' | 'completed' | 'failed' | 'refunded'

// ============================================
// Row types
// ============================================

export interface Profile {
  id: string
  email: string | null
  display_name: string | null
  alias: string | null
  profile_photo_url: string | null
  cover_photo_url: string | null
  story_text: string | null
  event_type: EventType
  event_date: string | null
  city: string | null
  state: string | null
  privacy_level: PrivacyLevel
  slug: string
  show_days_counter: boolean
  created_at: string
  updated_at: string
}

export interface RegistryItem {
  id: string
  user_id: string
  title: string
  description: string | null
  image_url: string | null
  source_url: string | null
  affiliate_url: string | null
  retailer: string | null
  price_cents: number | null
  category: ItemCategory
  priority: ItemPriority
  custom_note: string | null
  is_group_gift: boolean
  group_gift_target_cents: number | null
  group_gift_funded_cents: number
  status: ItemStatus
  claimed_by_name: string | null
  claimed_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface CashFund {
  id: string
  user_id: string
  title: string
  description: string | null
  goal_cents: number
  raised_cents: number
  fund_type: FundType
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Contribution {
  id: string
  cash_fund_id: string | null
  registry_item_id: string | null
  contributor_name: string
  contributor_email: string | null
  amount_cents: number
  is_anonymous: boolean
  message: string | null
  stripe_payment_id: string | null
  status: ContributionStatus
  created_at: string
  updated_at: string
}

export interface Encouragement {
  id: string
  profile_id: string
  author_name: string
  message: string
  is_public: boolean
  created_at: string
}

// ============================================
// Supabase Database type
// ============================================
// NOTE: For a production app, generate this with `supabase gen types typescript`.
// For now we use a simple type alias. The row interfaces above are used
// directly in application code for type safety.
export type Database = any

import type { EventType, ItemCategory, ItemPriority, FundType, PrivacyLevel } from '@/lib/types/database'

export const EVENT_LABELS: Record<EventType, string> = {
  breakup: 'Breakup',
  divorce: 'Divorce',
  canceled_wedding: 'Canceled Wedding',
  fresh_start: 'Fresh Start',
  job_loss: 'Job Loss',
  medical: 'Medical Crisis',
  housing: 'Housing Change',
  other: 'Other',
}

export const EVENT_EMOJI: Record<EventType, string> = {
  breakup: '💔',
  divorce: '📝',
  canceled_wedding: '🚫💒',
  fresh_start: '🌅',
  job_loss: '📦',
  medical: '🏥',
  housing: '🏠',
  other: '🔄',
}

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  the_basics: 'The Basics',
  kitchen_reset: 'Kitchen Reset',
  bedroom_glowup: 'Bedroom Glow-Up',
  living_solo: 'Living Solo',
  self_care: 'Self-Care & Survival',
  wheels: 'Wheels',
  petty_fund: 'The Petty Fund',
  fresh_start_fund: 'Fresh Start Fund',
  treat_yoself: "Treat Yo'self",
  pets: 'Fur Baby Needs',
  tech: 'Tech & Gadgets',
  other: 'Other',
}

export const CATEGORY_DESCRIPTIONS: Record<ItemCategory, string> = {
  the_basics: 'Toilet paper, paper towels, trash bags. The unsexy essentials.',
  kitchen_reset: 'He kept the pots. Time for an upgrade anyway.',
  bedroom_glowup: 'New sheets. New vibes. New chapter.',
  living_solo: "One couch. One TV. One set of everything, and it's all yours.",
  self_care: "Therapy isn't cheap, but a weighted blanket helps in the meantime.",
  wheels: "Getting around when the shared car isn't shared anymore.",
  petty_fund: 'Cash toward something that would make your ex mad.',
  fresh_start_fund: "First/last month's rent, security deposit, moving costs.",
  treat_yoself: 'Because you deserve something nice right now.',
  pets: 'Because at least the dog still loves you unconditionally.',
  tech: 'The Netflix account was his. Time for your own everything.',
  other: "Stuff that doesn't fit neatly into a box. Kind of like your life right now.",
}

export const PRIORITY_LABELS: Record<ItemPriority, string> = {
  need: 'Need',
  want: 'Want',
  dream: 'Dream',
}

export const PRIVACY_LABELS: Record<PrivacyLevel, string> = {
  public: 'Public (anyone can find)',
  link_only: 'Link only (share the link)',
  private: 'Private (only for you)',
}

export const PRIORITY_COLORS: Record<ItemPriority, string> = {
  need: 'bg-red-100 text-red-800',
  want: 'bg-amber-100 text-amber-800',
  dream: 'bg-purple-100 text-purple-800',
}

export const FUND_LABELS: Record<FundType, string> = {
  moving: 'Moving Expenses',
  deposit: 'Security Deposit',
  legal: 'Legal Fees',
  therapy: 'Therapy Fund',
  pet: 'Pet Custody',
  travel: 'Get Me Out of Here',
  petty: 'The Petty Fund',
  custom: 'Custom Fund',
}

export const FUND_DESCRIPTIONS: Record<FundType, string> = {
  moving: "Boxes, movers, and the gas to get the hell out of there.",
  deposit: "First, last, and the security deposit on a place that's just yours.",
  legal: "Divorce paperwork isn't free. Neither is peace of mind.",
  therapy: "Professional help for processing what happened.",
  pet: "Because custody battles aren't just for kids.",
  travel: "Sometimes you need to physically remove yourself from the situation.",
  petty: "Living well is the best revenge. This fund helps.",
  custom: "You know what you need. Tell them.",
}

export const SUPPORTED_RETAILERS = [
  { name: 'Amazon', domain: 'amazon.com', color: '#FF9900' },
  { name: 'Target', domain: 'target.com', color: '#CC0000' },
  { name: 'Walmart', domain: 'walmart.com', color: '#0071DC' },
  { name: 'Best Buy', domain: 'bestbuy.com', color: '#0046BE' },
  { name: 'IKEA', domain: 'ikea.com', color: '#0058A3' },
  { name: 'Wayfair', domain: 'wayfair.com', color: '#7B2D8E' },
  { name: 'Etsy', domain: 'etsy.com', color: '#F16521' },
  { name: 'Chewy', domain: 'chewy.com', color: '#1C49C2' },
] as const

import { z } from 'zod'
import { NextResponse } from 'next/server'

// ============================================
// Enum values (must match database.ts types)
// ============================================

const ITEM_CATEGORIES = [
  'the_basics', 'kitchen_reset', 'bedroom_glowup', 'living_solo',
  'self_care', 'wheels', 'petty_fund', 'fresh_start_fund',
  'treat_yoself', 'pets', 'tech', 'other',
] as const

const ITEM_PRIORITIES = ['need', 'want', 'dream'] as const

const FUND_TYPES = [
  'moving', 'deposit', 'legal', 'therapy',
  'pet', 'travel', 'petty', 'custom',
] as const

const EVENT_TYPES = [
  'breakup', 'divorce', 'canceled_wedding', 'fresh_start',
  'job_loss', 'medical', 'housing', 'other',
] as const

// ============================================
// Reusable field validators
// ============================================

const safeString = (maxLength: number) =>
  z.string().trim().min(1).max(maxLength)

const optionalSafeString = (maxLength: number) =>
  z.string().trim().max(maxLength).optional().nullable()

const safeUrl = z.string().url().max(2048).optional().nullable()

const safePriceCents = z.number().int().min(0).max(99_999_999).optional().nullable()

// ============================================
// API Route Schemas
// ============================================

// POST /api/registry
export const createRegistryItemSchema = z.object({
  title: safeString(255),
  description: optionalSafeString(2000),
  imageUrl: safeUrl,
  sourceUrl: safeUrl,
  affiliateUrl: safeUrl,
  retailer: optionalSafeString(100),
  priceCents: safePriceCents,
  category: z.enum(ITEM_CATEGORIES),
  priority: z.enum(ITEM_PRIORITIES),
  customNote: optionalSafeString(500),
  isGroupGift: z.boolean().optional().default(false),
  proxyProfileId: z.string().uuid().optional().nullable(),
})

// PATCH /api/registry/[id] — strict: rejects unknown fields
export const updateRegistryItemSchema = z.object({
  title: safeString(255).optional(),
  description: optionalSafeString(2000),
  image_url: safeUrl,
  source_url: safeUrl,
  affiliate_url: safeUrl,
  retailer: optionalSafeString(100),
  price_cents: safePriceCents,
  category: z.enum(ITEM_CATEGORIES).optional(),
  priority: z.enum(ITEM_PRIORITIES).optional(),
  custom_note: optionalSafeString(500),
  is_group_gift: z.boolean().optional(),
  sort_order: z.number().int().min(0).max(9999).optional(),
}).strict()

// POST /api/registry/[id] (claim action)
export const claimRegistryItemSchema = z.object({
  action: z.literal('claim'),
  claimed_by_name: safeString(100),
})

// POST /api/funds
export const createFundSchema = z.object({
  title: safeString(255),
  description: optionalSafeString(2000),
  goal_cents: z.number().int().min(100).max(999_999_99), // $1 min, $9,999.99 max
  fund_type: z.enum(FUND_TYPES),
  proxyProfileId: z.string().uuid().optional().nullable(),
})

// POST /api/encouragements
export const createEncouragementSchema = z.object({
  profile_id: z.string().uuid(),
  author_name: safeString(100),
  message: safeString(2000),
  is_public: z.boolean().optional().default(true),
})

// POST /api/scrape
export const scrapeUrlSchema = z.object({
  url: z.string().url().max(2048),
})

// POST /api/proxy-registry
export const createProxyRegistrySchema = z.object({
  recipientName: safeString(100),
  relationship: safeString(100),
  recipientEmail: z.string().email().max(320).optional().nullable().or(z.literal('')),
  eventType: z.enum(EVENT_TYPES).optional().default('other'),
  storyText: optionalSafeString(5000),
  city: optionalSafeString(100),
  state: optionalSafeString(100),
})

// ============================================
// Helper to validate and return parsed data or error response
// ============================================

export function validateBody<T>(schema: z.ZodSchema<T>, body: unknown):
  { success: true; data: T } | { success: false; response: NextResponse } {
  const result = schema.safeParse(body)
  if (!result.success) {
    const firstError = result.error.issues[0]
    const message = firstError
      ? `${firstError.path.join('.')}: ${firstError.message}`
      : 'Invalid request body'
    return {
      success: false,
      response: NextResponse.json({ error: message }, { status: 400 }),
    }
  }
  return { success: true, data: result.data }
}

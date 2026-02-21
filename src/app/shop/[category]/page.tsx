import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CURATED_ITEMS, getRetailersForCategory } from '@/lib/curated-items'
import { CATEGORY_LABELS } from '@/lib/constants'
import { CategoryShopClient } from '@/components/shop/category-shop-client'
import type { ItemCategory } from '@/lib/types/database'

// Valid categories for this route
const VALID_CATEGORIES = Object.keys(CURATED_ITEMS) as ItemCategory[]

interface ShopCategoryPageProps {
  params: Promise<{ category: string }>
}

export async function generateStaticParams() {
  return VALID_CATEGORIES.map((category) => ({ category }))
}

export async function generateMetadata({ params }: ShopCategoryPageProps) {
  const { category } = await params
  const label = CATEGORY_LABELS[category as ItemCategory]
  if (!label) return { title: 'Shop | welp.' }
  return {
    title: `${label} | Shop | welp.`,
    description: `Browse curated ${label.toLowerCase()} items for your fresh start registry.`,
  }
}

export default async function ShopCategoryPage({ params }: ShopCategoryPageProps) {
  const { category: rawCategory } = await params
  const category = rawCategory as ItemCategory

  // Validate category
  if (!VALID_CATEGORIES.includes(category)) {
    notFound()
  }

  const items = CURATED_ITEMS[category] ?? []
  const retailers = getRetailersForCategory(category)

  // Check login status (no redirect — guests can browse)
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const isLoggedIn = !!session?.user

  return (
    <CategoryShopClient
      category={category}
      items={items}
      retailers={retailers}
      isLoggedIn={isLoggedIn}
    />
  )
}

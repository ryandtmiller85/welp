import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

const BASE_URL = 'https://alliswelp.com'

const SHOP_CATEGORIES = [
  'the_basics',
  'kitchen_reset',
  'bedroom_glowup',
  'living_solo',
  'self_care',
  'petty_fund',
  'treat_yoself',
  'pets',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/shop`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/merch`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
  ]

  // Shop category pages
  const shopPages: MetadataRoute.Sitemap = SHOP_CATEGORIES.map((category) => ({
    url: `${BASE_URL}/shop/${category}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  // Public registry pages (only public ones, not link_only)
  let registryPages: MetadataRoute.Sitemap = []
  try {
    const supabase = await createClient()
    const { data: profiles } = await supabase
      .from('profiles')
      .select('slug, updated_at')
      .eq('privacy_level', 'public')
      .not('slug', 'is', null)

    if (profiles) {
      registryPages = profiles.map((profile) => ({
        url: `${BASE_URL}/${profile.slug}`,
        lastModified: new Date(profile.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.5,
      }))
    }
  } catch {
    // If Supabase is unavailable, just skip dynamic pages
  }

  return [...staticPages, ...shopPages, ...registryPages]
}

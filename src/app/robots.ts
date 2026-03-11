import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/auth/',
          '/claim/',
        ],
      },
    ],
    sitemap: 'https://alliswelp.com/sitemap.xml',
  }
}

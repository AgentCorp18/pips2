import type { MetadataRoute } from 'next'
import { getBaseUrl } from '@/lib/base-url'

const BASE_URL = getBaseUrl()

const robots = (): MetadataRoute.Robots => ({
  rules: [
    {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/projects/',
        '/tickets/',
        '/teams/',
        '/settings/',
        '/reports/',
        '/knowledge/',
        '/initiatives/',
        '/chat/',
        '/forms/',
        '/onboarding/',
        '/my-work/',
        '/notifications/',
        '/profile/',
        '/search/',
        '/tools/',
        '/training/',
        '/export/',
        '/api/',
        '/invite/',
      ],
    },
  ],
  sitemap: `${BASE_URL}/sitemap.xml`,
})

export default robots

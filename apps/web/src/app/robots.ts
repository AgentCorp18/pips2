import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pips-app.vercel.app'

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
        '/api/',
        '/invite/',
      ],
    },
  ],
  sitemap: `${BASE_URL}/sitemap.xml`,
})

export default robots

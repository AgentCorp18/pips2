import type { MetadataRoute } from 'next'
import { BOOK_CHAPTER_MAP, STEP_CONTENT } from '@pips/shared'
import { getBaseUrl } from '@/lib/base-url'
import { GLOSSARY_TERMS } from './(marketing)/resources/glossary/_glossary-data'
import { TOOL_DETAILS } from './(marketing)/methodology/tools/[toolSlug]/_tool-details'

const BASE_URL = getBaseUrl()

const sitemap = (): MetadataRoute.Sitemap => {
  const now = new Date()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/methodology`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/book`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/resources`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/resources/glossary`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/resources/templates`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/privacy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/login`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/signup`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.5,
    },
  ]

  // Methodology step pages (1-6)
  const stepPages: MetadataRoute.Sitemap = [1, 2, 3, 4, 5, 6].map((step) => ({
    url: `${BASE_URL}/methodology/step/${step}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Tool detail pages
  const toolSlugs = Object.keys(STEP_CONTENT).flatMap((stepNum) => {
    const content = STEP_CONTENT[parseInt(stepNum) as 1 | 2 | 3 | 4 | 5 | 6]
    return content.forms.map((form) => form.type.replace(/_/g, '-'))
  })

  // Only include tools that have detail pages
  const toolPages: MetadataRoute.Sitemap = toolSlugs
    .filter((slug) => TOOL_DETAILS[slug])
    .map((slug) => ({
      url: `${BASE_URL}/methodology/tools/${slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }))

  // Book chapter pages
  const chapterPages: MetadataRoute.Sitemap = BOOK_CHAPTER_MAP.map((ch) => ({
    url: `${BASE_URL}/book/${ch.chapter}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Glossary term pages
  const glossaryPages: MetadataRoute.Sitemap = GLOSSARY_TERMS.map((term) => ({
    url: `${BASE_URL}/resources/glossary/${term.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...stepPages, ...toolPages, ...chapterPages, ...glossaryPages]
}

export default sitemap

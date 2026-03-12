import type { Metadata } from 'next'
import {
  LandingNav,
  HeroSection,
  ProblemSolutionSection,
  MethodologySection,
  FeaturesSection,
  TrustSection,
  CtaSection,
  LandingFooter,
} from '@/components/landing'
import { JsonLd } from '@/components/seo/json-ld'
import { getBaseUrl } from '@/lib/base-url'

const BASE_URL = getBaseUrl()

export const metadata: Metadata = {
  title: 'Transform How Your Team Solves Problems | PIPS',
  description:
    'PIPS embeds a proven 6-step methodology into your workflow — guiding teams from problem identification through measurable results.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'PIPS — Transform How Your Team Solves Problems',
    description:
      'A 6-step methodology embedded in project management software. Guide your team from problem identification through measurable results.',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'PIPS — Transform How Your Team Solves Problems',
    description:
      'A 6-step methodology embedded in project management software. Guide your team from problem identification through measurable results.',
  },
}

const webApplicationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'PIPS',
  url: BASE_URL,
  description:
    'A 6-step process improvement methodology embedded in project management software that helps teams identify problems, analyze root causes, and deliver measurable results.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    description: 'Free beta access',
  },
  featureList: [
    'Problem Statement Builder',
    'Fishbone Diagram Creator',
    '5-Why Root Cause Analysis',
    'Criteria Matrix Scoring',
    'RACI Chart Builder',
    'Implementation Plan Tracker',
    'Before-After Comparison Reports',
    'Team Collaboration',
  ],
}

export const HomePage = () => {
  return (
    <main id="main-content" className="min-h-screen">
      <JsonLd data={webApplicationJsonLd} />
      <LandingNav />
      <HeroSection />
      <ProblemSolutionSection />
      <MethodologySection />
      <FeaturesSection />
      <TrustSection />
      <CtaSection />
      <LandingFooter />
    </main>
  )
}

export default HomePage

import type { Metadata } from 'next'
import {
  LandingNav,
  HeroSection,
  MethodologySection,
  FeaturesSection,
  HowItWorksSection,
  CtaSection,
  LandingFooter,
} from '@/components/landing'
import { JsonLd } from '@/components/seo/json-ld'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://pips-app.vercel.app'

export const metadata: Metadata = {
  title: 'Process Improvement Made Simple',
  description:
    'PIPS is a 6-step methodology embedded in project management software that helps teams identify problems, analyze root causes, and deliver measurable results.',
  openGraph: {
    title: 'PIPS — Process Improvement Made Simple',
    description:
      'A 6-step methodology embedded in project management software. Identify problems, analyze root causes, and deliver measurable results.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PIPS — Process Improvement Made Simple',
    description:
      'A 6-step methodology embedded in project management software. Identify problems, analyze root causes, and deliver measurable results.',
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
    <main className="min-h-screen">
      <JsonLd data={webApplicationJsonLd} />
      <LandingNav />
      <HeroSection />
      <MethodologySection />
      <FeaturesSection />
      <HowItWorksSection />
      <CtaSection />
      <LandingFooter />
    </main>
  )
}

export default HomePage

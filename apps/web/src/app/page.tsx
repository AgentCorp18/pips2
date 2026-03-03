import type { Metadata } from 'next'
import {
  HeroSection,
  MethodologySection,
  FeaturesSection,
  HowItWorksSection,
  CtaSection,
  LandingFooter,
} from '@/components/landing'

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

export const HomePage = () => {
  return (
    <main className="min-h-screen">
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

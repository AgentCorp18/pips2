import {
  HeroSection,
  MethodologySection,
  FeaturesSection,
  HowItWorksSection,
  CtaSection,
  LandingFooter,
} from '@/components/landing'

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

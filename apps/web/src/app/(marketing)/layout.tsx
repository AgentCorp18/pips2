import { LandingNav, LandingFooter } from '@/components/landing'

const MarketingLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <LandingNav />
      {children}
      <LandingFooter />
    </>
  )
}

export default MarketingLayout

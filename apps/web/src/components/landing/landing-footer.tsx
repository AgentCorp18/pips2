import Link from 'next/link'
import { PIPS_STEPS } from '@pips/shared'

const FOOTER_LINKS = {
  Product: [
    { label: 'Methodology', href: '/methodology' },
    { label: 'Resources', href: '/resources' },
    { label: 'Book', href: '/book' },
    { label: 'Glossary', href: '/resources/glossary' },
    { label: 'Pricing', href: '/pricing' },
  ],
  Account: [
    { label: 'Sign Up', href: '/signup' },
    { label: 'Sign In', href: '/login' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
  ],
} as const

export const LandingFooter = () => {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0F0C1A] px-6 pb-8 pt-16 md:px-8">
      <div className="mx-auto max-w-[1200px]">
        {/* Footer grid */}
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-[2fr_1fr_1fr_1fr] md:gap-12">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              {/* Logo dots */}
              <div className="flex gap-[3px]">
                {PIPS_STEPS.map((step) => (
                  <span
                    key={step.number}
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: step.color }}
                  />
                ))}
              </div>
              <span className="text-xl font-bold tracking-[0.05em] text-white">PIPS</span>
            </div>
            <p className="max-w-[280px] text-sm leading-relaxed text-white/60">
              A 6-step process improvement methodology embedded in project management software.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(FOOTER_LINKS).map(([heading, links]) => (
            <div key={heading}>
              <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.08em] text-white/60">
                {heading}
              </p>
              <ul className="flex flex-col gap-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white/80"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Step gradient stripe */}
        <div className="step-gradient-stripe-smooth mb-6 rounded-full" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 md:flex-row">
          <p className="text-xs text-white/50">
            &copy; {new Date().getFullYear()} PIPS. All rights reserved.
          </p>
          <p className="text-xs text-white/50">Built with the PIPS methodology</p>
        </div>
      </div>
    </footer>
  )
}

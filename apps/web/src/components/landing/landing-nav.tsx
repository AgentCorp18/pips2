import Link from 'next/link'
import { PIPS_STEPS } from '@pips/shared'

const NAV_LINKS = [
  { label: 'Methodology', href: '/methodology' },
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '/pricing' },
] as const

export const LandingNav = () => {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[var(--color-primary-deep)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex gap-[3px]">
            {PIPS_STEPS.map((step) => (
              <span
                key={step.number}
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: step.color }}
              />
            ))}
          </div>
          <span className="text-lg font-bold tracking-[0.05em] text-white">PIPS</span>
        </Link>

        {/* Nav links — hidden on small screens */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-white/60 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-hover)]"
          >
            Start Free
          </Link>
        </div>
      </div>
    </header>
  )
}

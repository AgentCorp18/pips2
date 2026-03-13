'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { PIPS_STEPS } from '@pips/shared'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Methodology', href: '/methodology' },
  { label: 'Book', href: '/book' },
  { label: 'Pricing', href: '/pricing' },
] as const

export const LandingNav = () => {
  const [mobileOpen, setMobileOpen] = useState(false)

  const closeMobile = () => setMobileOpen(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/[0.06] bg-[var(--color-primary-deep)]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6 md:px-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5" onClick={closeMobile}>
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
              className="text-sm font-medium text-white/80 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons — always visible on desktop */}
        <div className="hidden items-center gap-3 md:flex">
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

        {/* Mobile: auth buttons + hamburger */}
        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/login"
            className="text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="rounded-[var(--radius-md)] bg-[var(--color-primary)] px-4 py-1.5 text-sm font-semibold text-white transition-all hover:bg-[var(--color-primary-hover)]"
          >
            Start Free
          </Link>
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((prev) => !prev)}
            className="ml-1 rounded-md p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile slide-down nav */}
      <div
        id="mobile-nav"
        className={cn(
          'overflow-hidden transition-all duration-300 ease-in-out md:hidden',
          mobileOpen ? 'max-h-64 border-t border-white/[0.06]' : 'max-h-0',
        )}
      >
        <nav className="flex flex-col px-6 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={closeMobile}
              className="py-3 text-base font-medium text-white/70 transition-colors hover:text-white border-b border-white/[0.06] last:border-b-0"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}

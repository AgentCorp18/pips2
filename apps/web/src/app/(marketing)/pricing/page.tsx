import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, Mail } from 'lucide-react'
import { PIPS_STEPS } from '@pips/shared'

import { getBaseUrl } from '@/lib/base-url'

const BASE_URL = getBaseUrl()

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Choose the right PIPS plan for your team. Start free with core workflow, upgrade for training, workshops, and enterprise features.',
  alternates: {
    canonical: '/pricing',
  },
  openGraph: {
    title: 'Pricing — PIPS',
    description:
      'Choose the right PIPS plan for your team. Start free with core workflow, upgrade for training, workshops, and enterprise features.',
    url: `${BASE_URL}/pricing`,
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Pricing — PIPS',
    description:
      'Choose the right PIPS plan for your team. Start free with core workflow, upgrade for training, workshops, and enterprise features.',
  },
}

const TIERS = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    description: 'Get started with the core 6-step workflow.',
    features: [
      '1 project',
      '3 team members',
      'Core 6-step workflow',
      'Knowledge Hub access',
      '18 interactive tools',
    ],
    cta: 'Start Free',
    ctaHref: '/signup',
    ctaStyle: 'primary' as const,
    badge: null,
    disabled: false,
  },
  {
    name: 'Professional',
    price: '$25',
    period: '/user/month',
    description: 'For teams serious about continuous improvement.',
    features: [
      'Unlimited projects',
      'Unlimited team members',
      'Training mode',
      'Workshop facilitation',
      'Reporting dashboard',
      'Priority support',
    ],
    cta: 'Coming Soon',
    ctaHref: null,
    ctaStyle: 'secondary' as const,
    badge: 'Coming Soon',
    disabled: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations that need full control.',
    features: [
      'Everything in Professional',
      'Custom branding',
      'SSO / SAML (coming soon)',
      'API access',
      'Dedicated support',
      'Custom onboarding',
    ],
    cta: 'Contact Us',
    ctaHref: 'mailto:hello@pips-app.com',
    ctaStyle: 'outline' as const,
    badge: null,
    disabled: false,
  },
] as const

export const PricingPage = () => {
  return (
    <main id="main-content" className="min-h-screen">
      {/* Header */}
      <section className="relative overflow-hidden bg-[var(--color-primary-deep)] px-6 pb-16 pt-32 text-center md:px-8 md:pt-40">
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              'radial-gradient(circle at center, rgba(79, 70, 229, 0.25) 1.5px, transparent 1.5px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="relative z-[2] mx-auto max-w-[680px]">
          <div className="mb-6 flex items-center justify-center gap-2">
            {PIPS_STEPS.map((step) => (
              <span
                key={step.number}
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: step.color }}
              />
            ))}
          </div>
          <h1 className="mb-4 font-serif text-[clamp(2rem,5vw,3rem)] leading-[1.1] text-white">
            Simple, Transparent Pricing
          </h1>
          <p className="text-[1.0625rem] leading-relaxed text-white/80">
            Start free. Upgrade when you are ready. No surprises.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="bg-[var(--color-neutral-50)] px-6 py-20 md:px-8">
        <div className="mx-auto grid max-w-[1100px] grid-cols-1 gap-8 md:grid-cols-3">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className="relative flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)] bg-white p-8 shadow-[var(--shadow-subtle)]"
            >
              {tier.badge && (
                <span className="absolute -top-3 right-6 rounded-full bg-[var(--color-primary)] px-3 py-1 text-xs font-semibold text-white">
                  {tier.badge}
                </span>
              )}
              <h2 className="mb-2 text-xl font-bold text-[var(--color-neutral-800)]">
                {tier.name}
              </h2>
              <div className="mb-4 flex items-baseline gap-1">
                <span className="font-serif text-[2.5rem] leading-none text-[var(--color-primary)]">
                  {tier.price}
                </span>
                {tier.period && (
                  <span className="text-sm text-[var(--color-text-secondary)]">{tier.period}</span>
                )}
              </div>
              <p className="mb-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {tier.description}
              </p>
              <ul className="mb-8 flex flex-1 flex-col gap-3">
                {tier.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2.5 text-sm text-[var(--color-neutral-700)]"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
              {tier.ctaHref && !tier.disabled ? (
                <Link
                  href={tier.ctaHref}
                  className={`inline-flex items-center justify-center gap-2 rounded-[var(--radius-md)] px-6 py-3 text-sm font-semibold transition-all ${
                    tier.ctaStyle === 'primary'
                      ? 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)]'
                      : 'border border-[var(--color-neutral-300)] bg-white text-[var(--color-neutral-700)] hover:bg-[var(--color-neutral-50)]'
                  }`}
                >
                  {tier.cta}
                  {tier.ctaStyle === 'primary' && <ArrowRight className="h-4 w-4" />}
                  {tier.ctaStyle === 'outline' && <Mail className="h-4 w-4" />}
                </Link>
              ) : (
                <button
                  disabled
                  className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-neutral-100)] px-6 py-3 text-sm font-semibold text-[var(--color-neutral-500)]"
                >
                  {tier.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-white px-6 py-16 text-center md:px-8">
        <div className="mx-auto max-w-[500px]">
          <h2 className="mb-3 font-serif text-2xl text-[var(--color-neutral-800)]">
            Not sure which plan is right?
          </h2>
          <p className="mb-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Start with the free plan and explore the full PIPS workflow. Upgrade anytime as your
            team grows.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-[var(--color-primary-hover)]"
          >
            Start Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  )
}

export default PricingPage

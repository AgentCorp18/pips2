import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PIPS_STEPS } from '@pips/shared'

export const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-[var(--color-primary-deep)] px-6 pb-24 pt-32 text-center md:px-8 md:pb-28 md:pt-40">
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(79, 70, 229, 0.25) 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[var(--color-primary-deep)] to-transparent" />

      <div className="relative z-[2] mx-auto max-w-[820px]">
        {/* Overline */}
        <span className="mb-5 inline-block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary-light)]">
          6-Step Process Improvement Methodology
        </span>

        {/* Headline */}
        <h1 className="mb-6 font-serif text-[clamp(2.5rem,6vw,3.25rem)] leading-[1.1] tracking-[-0.02em] text-white">
          Transform How Your Team Solves Problems
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mb-10 max-w-[600px] text-[clamp(1rem,2.5vw,1.125rem)] leading-relaxed text-white/65">
          PIPS embeds a proven methodology directly into your workflow — guiding teams from problem
          identification through measurable results.
        </p>

        {/* 6-step horizontal stepper */}
        <div className="mx-auto mb-12 flex max-w-[700px] items-center justify-center gap-4 md:gap-6">
          {PIPS_STEPS.map((step) => (
            <div key={step.number} className="flex flex-col items-center gap-2">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: step.color }}
              >
                {step.number}
              </div>
              <span className="hidden text-xs font-medium text-white/80 md:block">{step.name}</span>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-8 py-3.5 text-base font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-primary-hover)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.45)] active:translate-y-0 active:scale-[0.97]"
          >
            Start Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/methodology"
            className="inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-white/20 bg-transparent px-8 py-3.5 text-base font-medium text-white/80 transition-all hover:border-white/35 hover:bg-white/[0.06] hover:text-white"
          >
            See the Methodology
          </Link>
        </div>
      </div>
    </section>
  )
}

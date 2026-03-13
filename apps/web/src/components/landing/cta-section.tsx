import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PIPS_STEPS } from '@pips/shared'

export const CtaSection = () => {
  return (
    <section className="relative overflow-hidden bg-[var(--color-primary-deep)] px-6 py-24 text-center md:px-8 md:py-28">
      {/* Dot grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(79, 70, 229, 0.3) 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-[2] mx-auto max-w-[600px]">
        {/* Pip dots */}
        <div className="mb-8 flex items-center justify-center gap-2">
          {PIPS_STEPS.map((step) => (
            <span
              key={step.number}
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: step.color }}
            />
          ))}
        </div>

        <h2 className="mb-4 font-serif text-[clamp(1.75rem,4vw,2.5rem)] leading-[1.15] text-white">
          Ready to improve how your team improves?
        </h2>

        <p className="mb-9 text-[1.0625rem] leading-relaxed text-white/80">
          Start free — no credit card required. Explore the full 6-step methodology and see how PIPS
          can transform your improvement process.
        </p>

        <Link
          href="/signup"
          className="inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--color-primary)] px-8 py-3.5 text-base font-semibold text-white shadow-[0_4px_14px_rgba(79,70,229,0.35)] transition-all hover:-translate-y-0.5 hover:bg-[var(--color-primary-hover)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.45)] active:translate-y-0 active:scale-[0.97]"
        >
          Start Free
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  )
}

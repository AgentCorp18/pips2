import Link from 'next/link'
import { Crosshair, Search, Lightbulb, ClipboardCheck, Wrench, Gauge } from 'lucide-react'
import { PIPS_STEPS } from '@pips/shared'

const STEP_ICONS = [Crosshair, Search, Lightbulb, ClipboardCheck, Wrench, Gauge] as const

export const MethodologySection = () => {
  return (
    <section
      id="methodology"
      className="relative bg-[var(--color-neutral-50)] px-6 py-24 md:px-8 md:py-28"
    >
      {/* Section header */}
      <div className="mx-auto mb-16 max-w-[680px] text-center">
        <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
          The PIPS Framework
        </span>
        <h2 className="mb-4 font-serif text-[clamp(1.75rem,4vw,2.25rem)] leading-[1.2] tracking-[-0.02em] text-[var(--color-neutral-800)]">
          Six Steps to Better Processes
        </h2>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          A proven methodology that transforms how teams identify problems, generate solutions, and
          measure results.
        </p>
      </div>

      {/* Step gradient stripe */}
      <div className="step-gradient-stripe-smooth mx-auto mb-12 max-w-4xl rounded-full" />

      {/* Steps grid - 3x2 */}
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {PIPS_STEPS.map((step, i) => {
          const Icon = STEP_ICONS[i]!
          return (
            <Link
              key={step.number}
              href={`/methodology/step/${step.number}`}
              className="group relative rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)] bg-white p-7 transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-medium)]"
              style={{ borderTopWidth: '3px', borderTopColor: step.color }}
            >
              {/* Step header */}
              <div className="mb-4 flex items-center gap-3.5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-base font-bold text-white"
                  style={{ backgroundColor: step.color }}
                >
                  {step.number}
                </div>
                <h3 className="text-base font-semibold text-[var(--color-neutral-800)]">
                  {step.name}
                </h3>
              </div>

              {/* Description */}
              <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-secondary)]">
                {step.description}
              </p>

              {/* Icon */}
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg"
                style={{ backgroundColor: step.colorSubtle }}
              >
                <Icon className="h-4.5 w-4.5" style={{ color: step.color }} />
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

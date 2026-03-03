import { FolderPlus, Route, TrendingUp } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: FolderPlus,
    title: 'Create a Project',
    description:
      'Define your process improvement goal, set your team, and kick off with a clear problem statement.',
  },
  {
    number: '02',
    icon: Route,
    title: 'Follow the Steps',
    description:
      'Work through the 6 PIPS stages with guided forms, analysis tools, and collaboration features at every step.',
  },
  {
    number: '03',
    icon: TrendingUp,
    title: 'Measure Results',
    description:
      'Track outcomes against your original goals, capture lessons learned, and feed insights into the next cycle.',
  },
] as const

export const HowItWorksSection = () => {
  return (
    <section
      id="how-it-works"
      className="relative bg-[var(--color-cloud)] px-6 py-24 md:px-8 md:py-28"
    >
      {/* Dot grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            'radial-gradient(circle at center, rgba(79, 70, 229, 0.2) 1.5px, transparent 1.5px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-[1] mx-auto max-w-[1200px]">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-[680px] text-center">
          <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
            Quick Start
          </span>
          <h2 className="mb-4 font-serif text-[clamp(1.75rem,4vw,2.25rem)] leading-[1.2] tracking-[-0.02em] text-[var(--color-neutral-800)]">
            How It Works
          </h2>
          <p className="text-[1.0625rem] leading-relaxed text-[var(--color-neutral-500)]">
            Get up and running in minutes. PIPS turns methodology into action.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="rounded-[var(--radius-lg)] bg-white p-8 text-center shadow-[var(--shadow-subtle)]"
            >
              {/* Step number */}
              <span className="mb-4 inline-block font-serif text-[2.5rem] leading-none text-[var(--color-primary)]">
                {step.number}
              </span>

              {/* Icon */}
              <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-primary-subtle)]">
                <step.icon className="h-[22px] w-[22px] text-[var(--color-primary)]" />
              </div>

              {/* Title */}
              <h3 className="mb-3 text-lg font-semibold text-[var(--color-neutral-800)]">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-sm leading-relaxed text-[var(--color-neutral-500)]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

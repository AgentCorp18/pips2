import { BookOpen, Wrench, GraduationCap, Library } from 'lucide-react'

const STATS = [
  {
    icon: Library,
    value: '205+',
    label: 'Learning Resources',
    description: 'Guides, templates, and references',
  },
  {
    icon: Wrench,
    value: '18',
    label: 'Interactive Tools',
    description: 'Digital forms for every step',
  },
  {
    icon: GraduationCap,
    value: '4',
    label: 'Training Paths',
    description: 'From beginner to advanced',
  },
  {
    icon: BookOpen,
    value: '1',
    label: 'Proven Methodology',
    description: 'Based on the PIPS book',
  },
] as const

export const TrustSection = () => {
  return (
    <section className="bg-[var(--color-neutral-50)] px-6 py-24 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-[680px] text-center">
          <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
            Built on Proven Methodology
          </span>
          <h2 className="mb-4 font-serif text-[clamp(1.75rem,4vw,2.25rem)] leading-[1.2] tracking-[-0.02em] text-[var(--color-neutral-800)]">
            Grounded in Real-World Practice
          </h2>
          <p className="text-[1.0625rem] leading-relaxed text-[var(--color-neutral-500)]">
            PIPS is built on a methodology refined through years of real process improvement work,
            documented in a comprehensive guidebook.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[var(--radius-lg)] border border-[var(--color-neutral-200)] bg-white p-6 text-center transition-all duration-200 hover:shadow-[var(--shadow-low)]"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(79,70,229,0.08)]">
                <stat.icon className="h-[22px] w-[22px] text-[var(--color-primary)]" />
              </div>
              <div className="mb-1 font-serif text-[clamp(2rem,4vw,2.75rem)] leading-none text-[var(--color-primary)]">
                {stat.value}
              </div>
              <div className="mb-1 text-sm font-semibold text-[var(--color-neutral-800)]">
                {stat.label}
              </div>
              <div className="text-xs text-[var(--color-neutral-500)]">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

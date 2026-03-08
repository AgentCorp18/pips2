import { FileText, BookOpen, Users, GraduationCap, Radio, BarChart3 } from 'lucide-react'

const FEATURES = [
  {
    icon: FileText,
    title: 'Interactive Forms',
    description:
      'Digital forms for every step — problem statements, fishbone diagrams, 5-why analysis, criteria matrices, and more.',
  },
  {
    icon: BookOpen,
    title: 'Knowledge Hub',
    description:
      'A searchable library of 205+ resources, guides, templates, and references to support every phase.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Role-based access, team workspaces, and real-time notifications keep everyone aligned and accountable.',
  },
  {
    icon: GraduationCap,
    title: 'Training Mode',
    description:
      'Four guided training paths from beginner to advanced, with practice scenarios and self-assessment.',
  },
  {
    icon: Radio,
    title: 'Real-time Workshop',
    description:
      'Facilitate live improvement workshops with shared boards, voting, and collaborative brainstorming.',
  },
  {
    icon: BarChart3,
    title: 'Reporting & Insights',
    description:
      'Dashboards and evaluation tools help you measure impact, track progress, and refine your approach.',
  },
] as const

export const FeaturesSection = () => {
  return (
    <section id="features" className="bg-white px-6 py-24 md:px-8 md:py-28">
      {/* Section header */}
      <div className="mx-auto mb-16 max-w-[680px] text-center">
        <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
          Built for Teams
        </span>
        <h2 className="mb-4 font-serif text-[clamp(1.75rem,4vw,2.25rem)] leading-[1.2] tracking-[-0.02em] text-[var(--color-neutral-800)]">
          Everything You Need to Improve
        </h2>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-neutral-500)]">
          PIPS combines methodology guidance with project management tools so your team can focus on
          solving real problems.
        </p>
      </div>

      {/* Feature cards */}
      <div className="mx-auto grid max-w-[1200px] grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            className="rounded-[var(--radius-lg)] border border-[rgba(79,70,229,0.08)] bg-[var(--color-cloud)] p-7 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-low)]"
          >
            {/* Icon */}
            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(79,70,229,0.08)]">
              <feature.icon className="h-[22px] w-[22px] text-[var(--color-primary)]" />
            </div>

            {/* Title */}
            <h3 className="mb-2.5 text-[1.0625rem] font-semibold text-[var(--color-neutral-800)]">
              {feature.title}
            </h3>

            {/* Description */}
            <p className="text-sm leading-relaxed text-[var(--color-neutral-500)]">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

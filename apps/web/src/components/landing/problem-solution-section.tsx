import { AlertTriangle, CheckCircle2 } from 'lucide-react'

const PROBLEMS = [
  'Teams rely on scattered spreadsheets and ad-hoc processes',
  'No consistency in methodology across projects or departments',
  'Institutional knowledge is lost when people leave or projects end',
]

const SOLUTIONS = [
  'Structured digital forms that guide every step of the process',
  'Guided workflows ensuring consistency across all improvement projects',
  'A knowledge hub that captures and shares learnings organization-wide',
]

export const ProblemSolutionSection = () => {
  return (
    <section className="bg-white px-6 py-24 md:px-8 md:py-28">
      <div className="mx-auto max-w-[1200px]">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-[680px] text-center">
          <span className="mb-3 inline-block text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--color-primary)]">
            Why PIPS?
          </span>
          <h2 className="mb-4 font-serif text-[clamp(1.75rem,4vw,2.25rem)] leading-[1.2] tracking-[-0.02em] text-[var(--color-neutral-800)]">
            The Gap Between Intent and Impact
          </h2>
          <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
            Most teams want to improve their processes. Few have the tools and structure to do it
            consistently.
          </p>
        </div>

        {/* Problem / Solution grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* The Problem */}
          <div className="rounded-[var(--radius-lg)] border border-red-100 bg-red-50/50 p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-neutral-800)]">The Problem</h3>
            </div>
            <ul className="flex flex-col gap-4">
              {PROBLEMS.map((problem) => (
                <li
                  key={problem}
                  className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-neutral-600)]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                  {problem}
                </li>
              ))}
            </ul>
          </div>

          {/* The Solution */}
          <div className="rounded-[var(--radius-lg)] border border-emerald-100 bg-emerald-50/50 p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--color-neutral-800)]">
                The Solution
              </h3>
            </div>
            <ul className="flex flex-col gap-4">
              {SOLUTIONS.map((solution) => (
                <li
                  key={solution}
                  className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-neutral-600)]"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {solution}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

import Link from 'next/link'
import { Award, BookOpen, Clock, ArrowRight, Lightbulb, CheckCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { WORKSHOP_MODULE_DATA } from '../module-data'

// ---------------------------------------------------------------------------
// Static content
// ---------------------------------------------------------------------------

const FACILITATION_TIPS = [
  {
    title: 'Set the tone early',
    description:
      'Open every workshop with a brief icebreaker and clear ground rules. This reduces anxiety and creates psychological safety for participation.',
  },
  {
    title: 'Time-box ruthlessly',
    description:
      'Use a visible timer for every activity. When time is up, wrap up even if the discussion is lively — you can always park items for follow-up.',
  },
  {
    title: 'Ask, do not tell',
    description:
      'Facilitators guide the process, not the content. Use open-ended questions to draw out ideas rather than providing answers.',
  },
  {
    title: 'Use the parking lot',
    description:
      'When off-topic but valuable ideas emerge, write them on a visible "parking lot" board. This validates the contributor without derailing the session.',
  },
  {
    title: 'Balance participation',
    description:
      'Watch for dominant voices. Use techniques like round-robin, silent writing, or dot voting to ensure equal input from all team members.',
  },
  {
    title: 'Close the loop',
    description:
      'End every session with a clear summary of decisions made, action items assigned, and the next meeting date. Send notes within 24 hours.',
  },
]

const BEST_PRACTICES = [
  'Prepare all materials and templates before the session starts',
  'Arrive 15 minutes early to set up the room and test any technology',
  'Print or share the agenda so every participant knows the plan',
  'Assign a scribe and timekeeper at the start of each session',
  'Take a 5-minute break for every 45 minutes of workshop time',
  'Debrief with the team after the workshop to capture lessons learned',
]

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: 'text-emerald-600',
  Intermediate: 'text-amber-600',
  Advanced: 'text-red-600',
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const FacilitatorPage = () => {
  const modules = Object.values(WORKSHOP_MODULE_DATA)
  const masterclass = WORKSHOP_MODULE_DATA['facilitator-masterclass']

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'rgba(8, 145, 178, 0.08)' }}
        >
          <Award size={20} className="text-[#0891B2]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Facilitator Guide</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Tips, best practices, and module-specific facilitation notes
          </p>
        </div>
      </div>

      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/knowledge" className="hover:text-[var(--color-primary)]">
          Knowledge Hub
        </Link>
        <span>/</span>
        <Link href="/knowledge/workshop" className="hover:text-[var(--color-primary)]">
          Workshop
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">Facilitator Guide</span>
      </nav>

      {/* Masterclass callout */}
      {masterclass && (
        <Link href={`/knowledge/workshop/modules/${masterclass.slug}`}>
          <Card className="group cursor-pointer border-[var(--color-primary)] bg-[var(--color-surface)] transition-all hover:shadow-sm">
            <CardContent className="flex items-center justify-between py-4">
              <div className="flex items-center gap-3">
                <Award size={18} className="text-[var(--color-primary)]" />
                <div>
                  <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                    {masterclass.title}
                  </h3>
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    {masterclass.description} &middot; {masterclass.duration}
                  </p>
                </div>
              </div>
              <ArrowRight
                size={14}
                className="text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
              />
            </CardContent>
          </Card>
        </Link>
      )}

      {/* Facilitation Tips */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Lightbulb size={16} className="text-[var(--color-text-tertiary)]" />
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Facilitation Tips
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {FACILITATION_TIPS.map((tip) => (
            <Card key={tip.title}>
              <CardContent className="py-4">
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                  {tip.title}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-[var(--color-text-tertiary)]">
                  {tip.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Best Practices */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle size={16} className="text-[var(--color-text-tertiary)]" />
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Best Practices Checklist
          </h2>
        </div>
        <Card>
          <CardContent className="py-4">
            <ul className="space-y-2">
              {BEST_PRACTICES.map((practice) => (
                <li
                  key={practice}
                  className="flex items-start gap-2 text-xs text-[var(--color-text-secondary)]"
                >
                  <CheckCircle size={12} className="mt-0.5 shrink-0 text-emerald-500" />
                  {practice}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Module Facilitator Notes */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <BookOpen size={16} className="text-[var(--color-text-tertiary)]" />
          <h2 className="text-sm font-semibold text-[var(--color-text-primary)]">
            Module Facilitator Notes
          </h2>
        </div>
        <div className="space-y-3">
          {modules.map((mod) => (
            <Link key={mod.slug} href={`/knowledge/workshop/modules/${mod.slug}`}>
              <Card className="group cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-sm">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                          {mod.title}
                        </h3>
                        <span
                          className={`text-[10px] font-medium ${DIFFICULTY_COLORS[mod.difficulty] ?? ''}`}
                        >
                          {mod.difficulty}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1 text-xs text-[var(--color-text-tertiary)]">
                        <Clock size={11} />
                        {mod.duration}
                      </div>
                      <ul className="mt-2 space-y-1">
                        {mod.facilitatorNotes.slice(0, 2).map((note) => (
                          <li
                            key={note}
                            className="text-xs leading-relaxed text-[var(--color-text-tertiary)]"
                          >
                            &bull; {note}
                          </li>
                        ))}
                        {mod.facilitatorNotes.length > 2 && (
                          <li className="text-xs text-[var(--color-primary)]">
                            +{mod.facilitatorNotes.length - 2} more notes
                          </li>
                        )}
                      </ul>
                    </div>
                    <ArrowRight
                      size={14}
                      className="shrink-0 text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-0.5"
                    />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FacilitatorPage

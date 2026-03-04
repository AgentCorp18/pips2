import Link from 'next/link'
import { Compass, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PIPS_STEPS } from '@pips/shared'

const GuidePage = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'rgba(5, 150, 105, 0.08)' }}
        >
          <Compass size={20} className="text-[#059669]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Interactive Guide</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Step-by-step methodology — tools, roles, and processes for each PIPS step
          </p>
        </div>
      </div>

      <nav className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]">
        <Link href="/knowledge" className="hover:text-[var(--color-primary)]">
          Knowledge Hub
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-secondary)]">Interactive Guide</span>
      </nav>

      {/* Steps Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PIPS_STEPS.map((step) => (
          <Link key={step.number} href={`/knowledge/guide/step/${step.number}`}>
            <Card
              className="group h-full cursor-pointer transition-all hover:shadow-md"
              style={{ borderColor: step.colorSubtle }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.number}
                  </div>
                  <CardTitle className="text-base">{step.name}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--color-text-secondary)]">{step.description}</p>
                <div
                  className="mt-3 flex items-center gap-1 text-xs font-medium opacity-0 transition-opacity group-hover:opacity-100"
                  style={{ color: step.color }}
                >
                  Learn more <ArrowRight size={12} />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link href="/knowledge/guide/tools">
          <Card className="cursor-pointer transition-all hover:border-[var(--color-primary)]">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                  Tools Library
                </h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  All 18+ PIPS tools in one place
                </p>
              </div>
              <ArrowRight size={14} className="text-[var(--color-text-tertiary)]" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/knowledge/guide/roles">
          <Card className="cursor-pointer transition-all hover:border-[var(--color-primary)]">
            <CardContent className="flex items-center justify-between py-4">
              <div>
                <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
                  Roles & Responsibilities
                </h3>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  Leader, Process Guide, Scribe, and more
                </p>
              </div>
              <ArrowRight size={14} className="text-[var(--color-text-tertiary)]" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}

export default GuidePage

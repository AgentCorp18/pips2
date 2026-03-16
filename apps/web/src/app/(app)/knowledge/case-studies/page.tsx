import Link from 'next/link'
import { FileText, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ContentBreadcrumb } from '@/components/knowledge/content-breadcrumb'

const CASE_STUDIES = [
  {
    slug: 'closed-loop',
    title: 'The Closed Loop: Using PIPS to Improve PIPS',
    summary:
      'How the PIPS team ran a full 6-step cycle on its own application during beta testing — and shipped 5 features in a single session.',
    tags: ['Beta Testing', 'Dogfooding', 'Full Cycle'],
    readMinutes: 12,
  },
]

const CaseStudiesPage = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ContentBreadcrumb
        items={[
          { label: 'Knowledge Hub', href: '/knowledge' },
          { label: 'Case Studies', href: '/knowledge/case-studies' },
        ]}
      />

      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg"
          style={{ backgroundColor: 'var(--color-step-6-subtle)' }}
        >
          <FileText size={20} className="text-[var(--color-step-6)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Case Studies</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Real-world examples of the PIPS methodology in action
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {CASE_STUDIES.map((study) => (
          <Link key={study.slug} href={`/knowledge/case-studies/${study.slug}`}>
            <Card className="group cursor-pointer transition-all hover:border-[var(--color-primary)] hover:shadow-md">
              <CardContent className="flex items-center justify-between py-5">
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-semibold text-[var(--color-text-primary)] group-hover:text-[var(--color-primary)]">
                    {study.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--color-text-secondary)]">{study.summary}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {study.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-[10px]">
                        {tag}
                      </Badge>
                    ))}
                    <span className="text-xs text-[var(--color-text-tertiary)]">
                      {study.readMinutes} min read
                    </span>
                  </div>
                </div>
                <ArrowRight
                  size={16}
                  className="ml-4 shrink-0 text-[var(--color-text-tertiary)] transition-transform group-hover:translate-x-1 group-hover:text-[var(--color-primary)]"
                />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

export { CaseStudiesPage as default }

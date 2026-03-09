'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

type Section = {
  id: string
  label: string
}

type SectionAnchorNavProps = {
  sections: Section[]
  className?: string
}

export const SectionAnchorNav = ({ sections, className }: SectionAnchorNavProps) => {
  const [activeId, setActiveId] = useState<string>(sections[0]?.id ?? '')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Use the <main> scroll container as the IntersectionObserver root so
    // section tracking works correctly when <main> is the sole scroll area.
    const scrollRoot = document.getElementById('main-content') ?? null

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { root: scrollRoot, rootMargin: '-80px 0px -60% 0px', threshold: 0.1 },
    )

    const elements = sections
      .map((s) => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[]

    for (const el of elements) {
      observerRef.current.observe(el)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [sections])

  const handleClick = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return

    // Find the <main> scroll container to avoid triggering document-level scroll.
    // Using scrollIntoView without a container reference can cause dual-scroll
    // when the app layout uses overflow-hidden on the outer shell.
    const scrollContainer = el.closest('main') ?? document.getElementById('main-content')
    if (scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect()
      const elRect = el.getBoundingClientRect()
      const offset = elRect.top - containerRect.top + scrollContainer.scrollTop - 16
      scrollContainer.scrollTo({ top: offset, behavior: 'smooth' })
    } else {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <nav data-testid="section-anchor-nav" className={cn(className)} aria-label="Section navigation">
      {/* Desktop: vertical sidebar */}
      <ul className="hidden space-y-1 lg:block">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              data-testid={`anchor-link-${section.id}`}
              onClick={() => handleClick(section.id)}
              className={cn(
                'w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors',
                activeId === section.id
                  ? 'bg-primary/10 font-medium text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground',
              )}
            >
              {section.label}
            </button>
          </li>
        ))}
      </ul>

      {/* Mobile: horizontal scroll pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 lg:hidden">
        {sections.map((section) => (
          <button
            key={section.id}
            data-testid={`anchor-link-${section.id}`}
            onClick={() => handleClick(section.id)}
            className={cn(
              'shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              activeId === section.id
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary hover:text-primary',
            )}
          >
            {section.label}
          </button>
        ))}
      </div>
    </nav>
  )
}

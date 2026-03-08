'use client'

import Link from 'next/link'
import { FolderKanban, BookOpen, UserPlus, ArrowRight } from 'lucide-react'

const actions = [
  {
    key: 'create-project',
    href: '/projects/new',
    icon: FolderKanban,
    color: 'var(--color-step-1)',
    title: 'Create a Project',
    description: 'Start a new PIPS improvement cycle and walk through the 6-step methodology.',
  },
  {
    key: 'explore-methodology',
    href: '/knowledge',
    icon: BookOpen,
    color: 'var(--color-step-3)',
    title: 'Explore the Methodology',
    description: 'Learn about the PIPS framework, tools, and best practices before diving in.',
  },
  {
    key: 'invite-team',
    href: '/settings/members',
    icon: UserPlus,
    color: 'var(--color-step-4)',
    title: 'Invite Your Team',
    description: 'Process improvement is a team sport. Add members to collaborate on projects.',
  },
] as const

export const WelcomeCards = () => (
  <div data-testid="welcome-cards" className="space-y-6">
    <div>
      <h2
        className="text-lg font-semibold"
        style={{ color: 'var(--color-text-primary)' }}
        data-testid="welcome-cards-heading"
      >
        Get started with PIPS
      </h2>
      <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
        Here are a few things you can do to get the most out of your workspace.
      </p>
    </div>

    <div className="grid gap-4 sm:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon
        return (
          <Link
            key={action.key}
            href={action.href}
            data-testid={`welcome-action-${action.key}`}
            className="group flex flex-col rounded-[var(--radius-lg)] border border-[var(--color-border)] p-5 transition-all hover:border-[var(--color-primary)] hover:shadow-md"
          >
            <div
              className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: 'var(--color-primary-subtle)' }}
            >
              <Icon size={20} style={{ color: action.color }} />
            </div>
            <h3
              className="mb-1 text-sm font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {action.title}
            </h3>
            <p className="mb-3 flex-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
              {action.description}
            </p>
            <span
              className="inline-flex items-center gap-1 text-xs font-medium transition-colors group-hover:underline"
              style={{ color: 'var(--color-primary)' }}
            >
              Get started
              <ArrowRight size={12} />
            </span>
          </Link>
        )
      })}
    </div>
  </div>
)

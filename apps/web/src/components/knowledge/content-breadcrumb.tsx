import Link from 'next/link'

type BreadcrumbItem = {
  label: string
  href: string
}

type ContentBreadcrumbProps = {
  items: BreadcrumbItem[]
}

export const ContentBreadcrumb = ({ items }: ContentBreadcrumbProps) => {
  return (
    <nav
      data-testid="content-breadcrumb"
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-[var(--color-text-tertiary)]"
    >
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-1.5">
          {i > 0 && <span aria-hidden="true">/</span>}
          {i === items.length - 1 ? (
            <span className="text-[var(--color-text-secondary)]" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link href={item.href} className="hover:text-[var(--color-primary)]">
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}

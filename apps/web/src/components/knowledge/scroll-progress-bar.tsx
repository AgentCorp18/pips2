'use client'

import { useState, useEffect } from 'react'

export const ScrollProgressBar = () => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const mainContent = document.getElementById('main-content')
      const target = mainContent ?? document.documentElement

      const scrollTop = mainContent ? mainContent.scrollTop : window.scrollY
      const scrollHeight = target.scrollHeight - target.clientHeight

      if (scrollHeight > 0) {
        setProgress(Math.min(100, (scrollTop / scrollHeight) * 100))
      }
    }

    const mainContent = document.getElementById('main-content')
    const scrollTarget = mainContent ?? window

    scrollTarget.addEventListener('scroll', handleScroll, { passive: true })
    return () => scrollTarget.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div
      data-testid="scroll-progress-bar"
      className="sticky top-0 z-30 h-1 w-full bg-[var(--color-border)]"
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuenow={Math.round(progress)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full bg-[var(--color-primary)] transition-[width] duration-100 ease-out"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

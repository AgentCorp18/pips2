const PipDotsLogo = () => (
  <div className="flex items-center gap-3">
    <div className="flex items-center gap-1.5">
      <span className="step-1 pip-dot" />
      <span className="step-2 pip-dot" />
      <span className="step-3 pip-dot" />
      <span className="step-4 pip-dot" />
      <span className="step-5 pip-dot" />
      <span className="step-6 pip-dot" />
    </div>
    <span
      className="text-xl font-bold tracking-wide"
      style={{ color: 'var(--color-primary-deep)' }}
    >
      PIPS
    </span>
  </div>
)

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--color-bg)]">
      {/* Step gradient stripe at the very top */}
      <div className="step-gradient-stripe" />

      {/* Centered content */}
      <main
        id="main-content"
        className="flex flex-1 flex-col items-center justify-center px-4 py-8"
      >
        {/* Logo */}
        <div className="mb-8">
          <PipDotsLogo />
        </div>

        {/* Page content (card with form) */}
        <div className="w-full max-w-[420px]">{children}</div>

        {/* Footer */}
        <p className="mt-8 text-center text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          Process Improvement &amp; Problem Solving
        </p>
      </main>
    </div>
  )
}

export default AuthLayout

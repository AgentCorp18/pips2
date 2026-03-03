const HomePage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="step-gradient-stripe max-w-md" />
      <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text-primary)]">
        PIPS 2.0
      </h1>
      <p className="max-w-md text-center text-[var(--color-text-secondary)]">
        A 6-step process improvement methodology embedded in enterprise project management software.
      </p>
      <div className="step-gradient-stripe max-w-md" />
    </div>
  )
}

export default HomePage

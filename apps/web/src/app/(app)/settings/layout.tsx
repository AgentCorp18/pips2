import { SettingsNav } from './settings-nav'

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto max-w-[var(--content-max-width)]">
      <SettingsNav />
      {children}
    </div>
  )
}

export default SettingsLayout

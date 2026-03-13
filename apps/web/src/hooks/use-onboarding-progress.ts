import { useCallback, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'pips-onboarding-progress'

type OnboardingStep = 'read-overview' | 'explore-sample' | 'create-project' | 'invite-member'

type OnboardingState = {
  completedSteps: OnboardingStep[]
  dismissed: boolean
}

const DEFAULT_STATE: OnboardingState = {
  completedSteps: [],
  dismissed: false,
}

const getState = (): OnboardingState => {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    return JSON.parse(raw) as OnboardingState
  } catch {
    return DEFAULT_STATE
  }
}

const setState = (state: OnboardingState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new Event('storage'))
}

const subscribe = (callback: () => void) => {
  window.addEventListener('storage', callback)
  return () => window.removeEventListener('storage', callback)
}

const getSnapshot = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    return ''
  }
}

const getServerSnapshot = () => ''

export const useOnboardingProgress = () => {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const state: OnboardingState = raw ? (JSON.parse(raw) as OnboardingState) : DEFAULT_STATE

  const completeStep = useCallback((step: OnboardingStep) => {
    const current = getState()
    if (current.completedSteps.includes(step)) return
    setState({ ...current, completedSteps: [...current.completedSteps, step] })
  }, [])

  const dismiss = useCallback(() => {
    const current = getState()
    setState({ ...current, dismissed: true })
  }, [])

  const isStepComplete = useCallback(
    (step: OnboardingStep) => state.completedSteps.includes(step),
    [state.completedSteps],
  )

  const allComplete = state.completedSteps.length >= 4 || state.dismissed

  return {
    completedSteps: state.completedSteps,
    isStepComplete,
    completeStep,
    dismiss,
    allComplete,
    dismissed: state.dismissed,
  }
}

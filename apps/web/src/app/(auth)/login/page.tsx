import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from './login-form'
import { getBaseUrl } from '@/lib/base-url'

const BASE_URL = getBaseUrl()

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your PIPS account to manage process improvement projects and tickets.',
  alternates: {
    canonical: '/login',
  },
  openGraph: {
    title: 'Sign In — PIPS',
    description: 'Sign in to your PIPS account to manage process improvement projects and tickets.',
    url: `${BASE_URL}/login`,
    type: 'website',
  },
}

const LoginPage = () => {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

export default LoginPage

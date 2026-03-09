import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your PIPS account to manage process improvement projects and tickets.',
}

const LoginPage = () => {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

export default LoginPage

import type { Metadata } from 'next'
import { LoginForm } from './login-form'

export const metadata: Metadata = {
  title: 'Sign In - PIPS',
  description: 'Sign in to your PIPS account',
}

const LoginPage = () => {
  return <LoginForm />
}

export default LoginPage

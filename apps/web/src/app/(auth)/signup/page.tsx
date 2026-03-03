import type { Metadata } from 'next'
import { SignupForm } from './signup-form'

export const metadata: Metadata = {
  title: 'Sign Up - PIPS',
  description: 'Create a new PIPS account',
}

const SignupPage = () => {
  return <SignupForm />
}

export default SignupPage

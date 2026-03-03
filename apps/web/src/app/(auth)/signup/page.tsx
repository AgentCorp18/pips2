import type { Metadata } from 'next'
import { SignupForm } from './signup-form'

export const metadata: Metadata = {
  title: 'Sign Up',
  description:
    'Create a free PIPS account and start improving your processes with the 6-step methodology.',
}

const SignupPage = () => {
  return <SignupForm />
}

export default SignupPage

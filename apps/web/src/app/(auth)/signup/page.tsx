import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SignupForm } from './signup-form'
import { getBaseUrl } from '@/lib/base-url'

const BASE_URL = getBaseUrl()

export const metadata: Metadata = {
  title: 'Sign Up',
  description:
    'Create a free PIPS account and start improving your processes with the 6-step methodology.',
  alternates: {
    canonical: '/signup',
  },
  openGraph: {
    title: 'Sign Up — PIPS',
    description:
      'Create a free PIPS account and start improving your processes with the 6-step methodology.',
    url: `${BASE_URL}/signup`,
    type: 'website',
  },
}

const SignupPage = () => {
  return (
    <Suspense>
      <SignupForm />
    </Suspense>
  )
}

export default SignupPage

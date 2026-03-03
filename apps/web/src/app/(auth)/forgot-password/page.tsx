import type { Metadata } from 'next'
import { ForgotPasswordForm } from './forgot-password-form'

export const metadata: Metadata = {
  title: 'Forgot Password - PIPS',
  description: 'Reset your PIPS account password',
}

const ForgotPasswordPage = () => {
  return <ForgotPasswordForm />
}

export default ForgotPasswordPage

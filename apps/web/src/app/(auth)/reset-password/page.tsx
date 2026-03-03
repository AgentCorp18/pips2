import type { Metadata } from 'next'
import { ResetPasswordForm } from './reset-password-form'

export const metadata: Metadata = {
  title: 'Set New Password - PIPS',
  description: 'Set a new password for your PIPS account',
}

const ResetPasswordPage = () => {
  return <ResetPasswordForm />
}

export default ResetPasswordPage

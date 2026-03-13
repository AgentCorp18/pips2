import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getInvitation } from './actions'
import { InviteResponse } from './invite-response'

export const metadata: Metadata = {
  title: 'Accept Invitation',
  description: 'Accept an invitation to join an organization on PIPS',
}

interface InvitePageProps {
  params: Promise<{ token: string }>
}

const InvitePage = async ({ params }: InvitePageProps) => {
  const { token } = await params
  const result = await getInvitation(token)

  if (result.status === 'not_found') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">Invitation Not Found</CardTitle>
          <CardDescription className="text-center">
            This invitation link is invalid or does not exist.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--color-text-link)' }}
          >
            Go to sign in
          </Link>
        </CardFooter>
      </Card>
    )
  }

  if (result.status === 'expired') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">Invitation Expired</CardTitle>
          <CardDescription className="text-center">
            This invitation has expired. Please ask the organization admin to send a new invitation.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--color-text-link)' }}
          >
            Go to sign in
          </Link>
        </CardFooter>
      </Card>
    )
  }

  if (result.status === 'already_accepted') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">Already Accepted</CardTitle>
          <CardDescription className="text-center">
            This invitation has already been accepted. You can sign in to access the organization.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--color-text-link)' }}
          >
            Go to sign in
          </Link>
        </CardFooter>
      </Card>
    )
  }

  if (result.status === 'revoked') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-xl">Invitation Revoked</CardTitle>
          <CardDescription className="text-center">
            This invitation has been revoked by the organization admin.
          </CardDescription>
        </CardHeader>
        <CardFooter className="justify-center">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline"
            style={{ color: 'var(--color-text-link)' }}
          >
            Go to sign in
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-xl">You&apos;re Invited</CardTitle>
        <CardDescription className="text-center">
          You&apos;ve been invited to join an organization on PIPS
        </CardDescription>
      </CardHeader>

      <CardContent>
        <InviteResponse
          invitation={result.invitation}
          isLoggedIn={result.isLoggedIn}
          userEmail={result.userEmail}
          token={token}
        />
      </CardContent>
    </Card>
  )
}

export default InvitePage

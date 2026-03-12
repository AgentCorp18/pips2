import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Privacy Policy | PIPS',
  description: 'Privacy policy for PIPS — how we collect, use, and protect your data.',
  alternates: {
    canonical: '/privacy',
  },
}

const LAST_UPDATED = 'March 9, 2026'

export const PrivacyPage = () => {
  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* Header */}
      <section className="bg-[var(--color-primary-deep)] px-6 pb-12 pt-32 md:px-8 md:pt-36">
        <div className="mx-auto max-w-[720px]">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-white/50 transition-colors hover:text-white/80"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>
          <h1 className="font-serif text-[clamp(2rem,5vw,3rem)] leading-[1.1] text-white">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-white/50">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-16 md:px-8">
        <div className="prose prose-neutral mx-auto max-w-[720px] text-[var(--color-text-primary)]">
          <h2>1. Introduction</h2>
          <p>
            PIPS (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting
            your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you use our web application and services.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>Account Information</h3>
          <p>
            When you create an account, we collect your name, email address, and organization
            details. Authentication is handled securely through our identity provider.
          </p>
          <h3>Usage Data</h3>
          <p>
            We automatically collect information about how you interact with our services, including
            pages visited, features used, and timestamps. This helps us improve the product
            experience.
          </p>
          <h3>Project Data</h3>
          <p>
            Any content you create within PIPS — including projects, forms, tickets, and team
            configurations — is stored securely and associated with your organization.
          </p>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Authenticate your identity and manage your account</li>
            <li>Send transactional emails (invitations, notifications)</li>
            <li>Analyze usage patterns to improve the product</li>
            <li>Ensure security and prevent abuse</li>
          </ul>

          <h2>4. Data Sharing</h2>
          <p>
            We do not sell your personal data. We may share information with third-party service
            providers who assist in operating our platform (hosting, email delivery, analytics), but
            only as necessary to provide our services. All providers are contractually obligated to
            protect your data.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We implement industry-standard security measures including encryption in transit
            (TLS/SSL), encryption at rest, row-level security policies, and regular security audits.
            Access to your data within your organization is controlled by role-based permissions.
          </p>

          <h2>6. Data Retention</h2>
          <p>
            We retain your data for as long as your account is active. If you delete your account,
            we will remove your personal data within 30 days, except where retention is required by
            law.
          </p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Export your project data</li>
            <li>Withdraw consent for optional data processing</li>
          </ul>

          <h2>8. Cookies</h2>
          <p>
            We use essential cookies for authentication and session management. We may use analytics
            cookies to understand usage patterns. You can control cookie preferences through your
            browser settings.
          </p>

          <h2>9. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant
            changes via email or an in-app notification. Continued use of the service after changes
            constitutes acceptance of the updated policy.
          </p>

          <h2>10. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a
              href="mailto:hello@pips-app.com"
              className="text-[var(--color-primary)] hover:underline"
            >
              hello@pips-app.com
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  )
}

export default PrivacyPage

import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Terms of Service | PIPS',
  description: 'Terms of service for PIPS — the rules governing use of our platform.',
}

const LAST_UPDATED = 'March 9, 2026'

export const TermsPage = () => {
  return (
    <main className="min-h-screen bg-white">
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
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-white/50">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* Content */}
      <section className="px-6 py-16 md:px-8">
        <div className="prose prose-neutral mx-auto max-w-[720px] text-[var(--color-text-primary)]">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using PIPS (&quot;the Service&quot;), you agree to be bound by these
            Terms of Service. If you do not agree to these terms, do not use the Service.
          </p>

          <h2>2. Description of Service</h2>
          <p>
            PIPS is a web-based process improvement platform that provides a structured 6-step
            methodology for teams to identify problems, analyze root causes, develop solutions, and
            measure results. The Service includes project management tools, collaborative forms,
            reporting, and educational resources.
          </p>

          <h2>3. Account Registration</h2>
          <p>
            You must provide accurate and complete information when creating an account. You are
            responsible for maintaining the security of your account credentials and for all
            activities that occur under your account.
          </p>

          <h2>4. Acceptable Use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to other accounts or systems</li>
            <li>Interfere with or disrupt the Service or its infrastructure</li>
            <li>Upload malicious code or content</li>
            <li>Resell or redistribute the Service without authorization</li>
            <li>Scrape, crawl, or use automated means to access the Service</li>
          </ul>

          <h2>5. Your Data</h2>
          <p>
            You retain ownership of all content you create within the Service. By using the Service,
            you grant us a limited license to store, process, and display your content as necessary
            to provide the Service. We will not use your content for purposes unrelated to the
            Service.
          </p>

          <h2>6. Organizations and Teams</h2>
          <p>
            PIPS operates on a multi-tenant model. Organization owners and administrators are
            responsible for managing access within their organization. We are not liable for actions
            taken by members within your organization.
          </p>

          <h2>7. Free and Paid Plans</h2>
          <p>
            The Service offers both free and paid subscription plans. Features and limits vary by
            plan. We reserve the right to modify pricing and plan features with reasonable notice.
            Paid subscriptions are billed according to the terms presented at purchase.
          </p>

          <h2>8. Intellectual Property</h2>
          <p>
            The PIPS platform, including its methodology, design, code, and documentation, is
            protected by intellectual property laws. The 6-step PIPS methodology content is provided
            for your use within the platform but may not be reproduced or distributed outside of it
            without permission.
          </p>

          <h2>9. Limitation of Liability</h2>
          <p>
            The Service is provided &quot;as is&quot; without warranties of any kind. To the maximum
            extent permitted by law, we shall not be liable for any indirect, incidental, special,
            or consequential damages arising from your use of the Service.
          </p>

          <h2>10. Termination</h2>
          <p>
            We may suspend or terminate your access to the Service if you violate these Terms. You
            may delete your account at any time. Upon termination, your right to use the Service
            ceases immediately, though we will retain your data for a reasonable period to allow for
            data export.
          </p>

          <h2>11. Changes to Terms</h2>
          <p>
            We may modify these Terms at any time. We will provide notice of material changes via
            email or in-app notification. Your continued use of the Service after changes take
            effect constitutes acceptance of the updated Terms.
          </p>

          <h2>12. Governing Law</h2>
          <p>
            These Terms are governed by the laws of the jurisdiction in which PIPS operates, without
            regard to conflict of law principles.
          </p>

          <h2>13. Contact</h2>
          <p>
            For questions about these Terms, please contact us at{' '}
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

export default TermsPage

import Link from 'next/link';
import { LegalPageHeader, LegalSection } from '@/components/legal-section';
import { LEGAL } from '@/lib/legal-placeholders';

export default function RefundPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-10">
      <LegalPageHeader eyebrow="Legal" title="Refund & Cancellation Policy" />
      <p className="text-sm text-muted-foreground">Last updated: {LEGAL.lastUpdated}</p>

      <div className="space-y-8">
        <LegalSection title="1. Overview">
          <p>
            This policy applies to paid tracks on EduBridge Network — currently the Internship Program (Guided Learning / Own Project) and
            the Virtual Internship (4-Week / 4-Month tracks). All other features (browsing, Track B applications, scholarships,
            opportunities) are free and this policy does not apply to them.
          </p>
        </LegalSection>

        <LegalSection title="2. How payment & confirmation works">
          <p>
            Payment is currently manual: you pay the disclosed fee via UPI, submit your transaction reference in the app, and an EduBridge
            team member manually confirms it before your track is activated. Because confirmation is manual, refund requests are also
            handled manually by our team — there is no instant/automated refund at this time.
          </p>
        </LegalSection>

        <LegalSection title="3. Cancellation before payment is confirmed">
          <p>
            If you&apos;ve enrolled but your payment has not yet been confirmed, you can cancel by contacting {LEGAL.supportEmail} — no fee
            is owed since payment hasn&apos;t been verified as received.
          </p>
        </LegalSection>

        <LegalSection title="4. Refund eligibility after payment is confirmed">
          <p>You may request a refund within {LEGAL.refundWindowDays} days of your payment being confirmed, provided:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>You have not yet been assigned a mentor/team, or started any project milestone; or</li>
            <li>EduBridge is unable to activate or deliver the track you paid for within a reasonable time.</li>
          </ul>
          <p>Refund requests outside this window, or after a mentor/project has been assigned and work has begun, are handled at EduBridge&apos;s discretion.</p>
        </LegalSection>

        <LegalSection title="5. How to request a refund">
          <p>
            Email {LEGAL.supportEmail} with your registered email address and enrollment ID. Our team reviews each request individually and
            responds within {LEGAL.refundProcessingDays} business days.
          </p>
        </LegalSection>

        <LegalSection title="6. How refunds are paid">
          <p>
            Approved refunds are sent back via UPI to the same account the original payment was made from — we do not send refunds to a
            different account or payment method.
          </p>
        </LegalSection>

        <LegalSection title="7. Cancellation by EduBridge Network">
          <p>
            If we cancel or are unable to run a track you&apos;ve paid for, you will receive a full refund regardless of the timelines
            above.
          </p>
        </LegalSection>

        <LegalSection title="8. Contact us">
          <p>
            For any refund or cancellation query, reach us via{' '}
            <a href={`mailto:${LEGAL.supportEmail}`} className="font-semibold text-primary hover:underline">
              {LEGAL.supportEmail}
            </a>{' '}
            or our{' '}
            <Link href="/contact" className="font-semibold text-primary hover:underline">
              Contact page
            </Link>
            . See also our{' '}
            <Link href="/terms" className="font-semibold text-primary hover:underline">
              Terms &amp; Conditions
            </Link>
            .
          </p>
        </LegalSection>
      </div>
    </div>
  );
}

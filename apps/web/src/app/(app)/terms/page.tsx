import Link from 'next/link';
import { LegalPageHeader, LegalSection } from '@/components/legal-section';
import { LEGAL } from '@/lib/legal-placeholders';

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-10">
      <LegalPageHeader eyebrow="Legal" title="Terms & Conditions" />
      <p className="text-sm text-muted-foreground">Last updated: {LEGAL.lastUpdated}</p>

      <div className="space-y-8">
        <LegalSection title="1. Acceptance of terms">
          <p>
            These Terms &amp; Conditions govern your use of edubridgenetwork.in, operated by {LEGAL.entityName} (&quot;EduBridge
            Network&quot;, &quot;we&quot;, &quot;us&quot;). By creating an account or using the Platform, you agree to be bound by these
            terms. If you do not agree, please do not use the Platform.
          </p>
        </LegalSection>

        <LegalSection title="2. Eligibility & account">
          <p>
            You must provide accurate information when creating an account and are responsible for keeping your login credentials secure.
            You must be old enough to enter a binding agreement under applicable law, or have a parent/guardian&apos;s consent.
          </p>
        </LegalSection>

        <LegalSection title="3. Description of services">
          <p>
            EduBridge Network aggregates and provides access to college information and reviews, scholarships, internships, hackathons,
            research programs, and referral opportunities, along with mentor-guided paid tracks (the &quot;Internship Program&quot; and
            &quot;Virtual Internship&quot;). Free features (browsing, applications to Track B, scholarships, opportunities) require no
            payment.
          </p>
        </LegalSection>

        <LegalSection title="4. Payments">
          <p>Paid tracks display their fee upfront before you enroll. Payment currently works as follows:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>You pay only via UPI to the UPI ID disclosed on the payment screen at the time of enrollment — we do not accept payment through any other channel, and are not responsible for payments sent to any other address.</li>
            <li>After paying, you submit the transaction reference/note in the app; an EduBridge team member manually verifies and confirms it, after which your track is activated.</li>
            <li>The fee shown at the time you enroll is the fee you owe — it does not change retroactively if pricing changes later.</li>
          </ul>
        </LegalSection>

        <LegalSection title="5. No guarantee of outcomes">
          <p>
            Completing a paid track, or being active on the Platform, does not guarantee a job offer, placement, internship conversion, or
            any specific outcome. Referrals, gigs, and opportunities surfaced on the Platform are opportunities to apply for, not
            guaranteed placements.
          </p>
        </LegalSection>

        <LegalSection title="6. User conduct">
          <p>You agree not to:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Post false, misleading, or plagiarised content, reviews, or submissions.</li>
            <li>Misuse the Platform to harass other users, mentors, or staff.</li>
            <li>Attempt to circumvent security, rate limits, or access controls.</li>
            <li>Use the Platform for any unlawful purpose.</li>
          </ul>
        </LegalSection>

        <LegalSection title="7. Third-party links & content">
          <p>
            The Platform links to third-party pages (including partner service pages, external application forms, and college websites).
            We are not responsible for the content, accuracy, or practices of third-party sites you&apos;re directed to.
          </p>
        </LegalSection>

        <LegalSection title="8. Intellectual property">
          <p>
            The Platform&apos;s design, branding, and original content are owned by {LEGAL.entityName}. Content you submit (reviews,
            project links, profile information) remains yours, but you grant us a licence to display it on the Platform in connection with
            the service you used it for.
          </p>
        </LegalSection>

        <LegalSection title="9. Limitation of liability">
          <p>
            The Platform is provided &quot;as is&quot;. To the extent permitted by law, EduBridge Network is not liable for indirect,
            incidental, or consequential damages arising from your use of the Platform, including reliance on third-party opportunity
            listings or outcomes of paid tracks.
          </p>
        </LegalSection>

        <LegalSection title="10. Termination">
          <p>
            We may suspend or terminate accounts that violate these terms. You may stop using the Platform at any time; refunds for paid
            tracks, where applicable, are governed by our{' '}
            <Link href="/refund-policy" className="font-semibold text-primary hover:underline">
              Refund &amp; Cancellation Policy
            </Link>
            .
          </p>
        </LegalSection>

        <LegalSection title="11. Governing law & jurisdiction">
          <p>These terms are governed by the laws of India. Any disputes will be subject to the exclusive jurisdiction of courts in {LEGAL.jurisdiction}.</p>
        </LegalSection>

        <LegalSection title="12. Changes to these terms">
          <p>We may update these terms from time to time; continued use of the Platform after changes take effect constitutes acceptance.</p>
        </LegalSection>

        <LegalSection title="13. Contact us">
          <p>
            Questions about these terms can be sent to{' '}
            <a href={`mailto:${LEGAL.supportEmail}`} className="font-semibold text-primary hover:underline">
              {LEGAL.supportEmail}
            </a>{' '}
            or via our{' '}
            <Link href="/contact" className="font-semibold text-primary hover:underline">
              Contact page
            </Link>
            .
          </p>
        </LegalSection>
      </div>
    </div>
  );
}

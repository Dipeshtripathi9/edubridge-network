import Link from 'next/link';
import { LegalPageHeader, LegalSection } from '@/components/legal-section';
import { LEGAL } from '@/lib/legal-placeholders';

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-10 pb-10">
      <LegalPageHeader eyebrow="Legal" title="Privacy Policy" />
      <p className="text-sm text-muted-foreground">Last updated: {LEGAL.lastUpdated}</p>

      <div className="space-y-8">
        <LegalSection title="1. Overview">
          <p>
            This Privacy Policy explains how {LEGAL.entityName} (&quot;EduBridge Network&quot;, &quot;we&quot;, &quot;us&quot;) collects, uses,
            shares and protects information when you use edubridgenetwork.in and its related services (the &quot;Platform&quot;). By using
            the Platform, you agree to this policy.
          </p>
        </LegalSection>

        <LegalSection title="2. Information we collect">
          <p>We collect information you provide directly, and some information automatically:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>Account details — name, email address, and phone number if provided; sign-in via email/password or Google OAuth.</li>
            <li>Profile details — academic background, interests, and other information you add to personalise recommendations.</li>
            <li>Enrollment and application data — internship/scholarship applications, submitted project links, mentor feedback.</li>
            <li>Payment references — for paid tracks, we collect the UPI transaction reference/note you submit to confirm payment. We do not collect or store your card number, UPI PIN, or bank credentials at any point.</li>
            <li>Usage data — pages visited, device/browser information, and log data, collected automatically to keep the Platform secure and working.</li>
          </ul>
        </LegalSection>

        <LegalSection title="3. How we use your information">
          <ul className="list-disc space-y-1.5 pl-5">
            <li>To operate your account, enrollments, and applications.</li>
            <li>To personalise college, scholarship, internship, and opportunity recommendations.</li>
            <li>To send notifications about your enrollments, applications, and payment status.</li>
            <li>To verify identity and prevent fraud or abuse of the Platform.</li>
            <li>To improve the Platform and understand how it&apos;s used.</li>
          </ul>
        </LegalSection>

        <LegalSection title="4. Payments and financial data">
          <p>
            EduBridge Network does not process card or bank payments directly. Paid tracks (such as the Internship and Virtual Internship
            programs) are settled via manual UPI transfer to a UPI ID we disclose on the payment screen. We store only the transaction
            reference note you submit and the confirmation status — never your card, bank, or UPI account credentials.
          </p>
        </LegalSection>

        <LegalSection title="5. Sharing of information">
          <p>We do not sell your personal information. We may share limited information:</p>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>With mentors, reviewers, or partner organisations directly involved in an application, internship, or gig you&apos;ve engaged with.</li>
            <li>With service providers who help us run the Platform (hosting, email delivery, analytics), under confidentiality obligations.</li>
            <li>When required by law, or to protect the rights, safety, or property of EduBridge Network or our users.</li>
          </ul>
        </LegalSection>

        <LegalSection title="6. Cookies">
          <p>
            We use cookies and similar technologies to keep you signed in and remember preferences. You can control cookies through your
            browser settings; disabling them may affect parts of the Platform.
          </p>
        </LegalSection>

        <LegalSection title="7. Data retention">
          <p>
            We retain account and enrollment data for as long as your account is active, or as needed to comply with legal, accounting, or
            reporting obligations. You may request deletion of your account as described below.
          </p>
        </LegalSection>

        <LegalSection title="8. Your rights">
          <p>
            You can access, update, or request deletion of your personal information by contacting us at{' '}
            <a href={`mailto:${LEGAL.supportEmail}`} className="font-semibold text-primary hover:underline">
              {LEGAL.supportEmail}
            </a>
            . We will respond within a reasonable time as required by applicable law.
          </p>
        </LegalSection>

        <LegalSection title="9. Children's privacy">
          <p>
            The Platform is intended for students generally above 13 years of age. If you believe a child has provided us personal
            information without appropriate consent, contact us and we will take steps to remove it.
          </p>
        </LegalSection>

        <LegalSection title="10. Changes to this policy">
          <p>
            We may update this Privacy Policy from time to time. Material changes will be reflected by updating the &quot;Last updated&quot;
            date above.
          </p>
        </LegalSection>

        <LegalSection title="11. Contact us">
          <p>
            Questions about this policy, or grievances regarding your data, can be sent to {LEGAL.grievanceOfficerName} at{' '}
            <a href={`mailto:${LEGAL.grievanceOfficerEmail}`} className="font-semibold text-primary hover:underline">
              {LEGAL.grievanceOfficerEmail}
            </a>
            , or via our{' '}
            <Link href="/contact" className="font-semibold text-primary hover:underline">
              Contact page
            </Link>
            . Registered address: {LEGAL.registeredAddress}.
          </p>
        </LegalSection>
      </div>
    </div>
  );
}

import Link from 'next/link';
import type { Metadata } from 'next';
import { BrandLockup } from '@/components/brand-lockup';
import { PageHero } from '@/components/page-hero';

export const metadata: Metadata = {
  title: 'Internship Program — EduBridge Network',
};

export default function InternshipComingSoonPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-border/70 px-4 py-4 md:px-6">
        <BrandLockup />
      </header>
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <PageHero
          eyebrow="Internship Program"
          title="We're rebuilding"
          accent="this page."
          sub="Our virtual internship program is being redesigned. Check back soon, or head back to your dashboard in the meantime."
        />
        <Link
          href="/home"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          Back to EduBridge Network
        </Link>
      </main>
    </div>
  );
}

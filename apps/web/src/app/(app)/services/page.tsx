import Link from 'next/link';
import { Award, GraduationCap, Rocket, Search, Share2 } from 'lucide-react';
import { cn } from '@/lib/utils';

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[2.8px] text-primary">
      <span className="h-0.5 w-[22px] rounded-full bg-marigold" /> {children}
    </span>
  );
}

const SERVICES = [
  {
    icon: GraduationCap,
    tone: 'bg-accent text-primary',
    title: 'College reviews & recommendations',
    body: 'Authentic student reviews, placement data, and personalised college recommendations to help you choose confidently.',
    href: '/reviews',
    cta: 'Explore colleges',
  },
  {
    icon: Award,
    tone: 'bg-marigold-soft text-amber-600',
    title: 'Scholarships',
    body: 'Discover scholarships matched to your profile — government, private, and global — free to browse and apply.',
    href: '/scholarships',
    cta: 'Find scholarships',
  },
  {
    icon: Search,
    tone: 'bg-green-soft text-green',
    title: 'Opportunities catalog',
    body: 'Internships, part-time and freelance gigs from companies and startups — shortlist, apply, and track everything in one place.',
    href: '/opportunities',
    cta: 'Browse opportunities',
  },
  {
    icon: Rocket,
    tone: 'bg-accent text-primary',
    title: 'Internship Program',
    body: 'A structured, mentor-guided internship — pick Guided Learning, build your Own Project, or apply free to Track B.',
    href: '/internship',
    cta: 'View the program',
  },
  {
    icon: Share2,
    tone: 'bg-green-soft text-green',
    title: 'Referral program',
    body: 'Finish select programs and get access to our referral network for a real head start on your next application.',
    href: '/referral',
    cta: 'See referral program',
  },
];

export default function ServicesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-14 pb-10">
      <section className="pt-2">
        <Eyebrow>What we offer</Eyebrow>
        <h1 className="mt-3 max-w-[720px] font-display text-[clamp(28px,4.8vw,46px)] font-extrabold leading-[1.08] tracking-[-.024em]">
          Everything you need from choosing a college to landing your first role.
        </h1>
        <p className="mt-4 max-w-[600px] text-[16px] text-muted-foreground">
          Free features you can use right away, and mentor-guided paid tracks with transparent, upfront pricing —{' '}
          <Link href="/pricing" className="font-semibold text-primary hover:underline">
            see full pricing
          </Link>
          .
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SERVICES.map((s) => (
          <Link
            key={s.title}
            href={s.href}
            className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <span className={cn('grid h-11 w-11 flex-none place-items-center rounded-[14px]', s.tone)}>
              <s.icon className="h-[21px] w-[21px]" />
            </span>
            <div>
              <h3 className="font-display text-[16px] font-bold tracking-tight">{s.title}</h3>
              <p className="mt-1.5 text-[13.5px] text-muted-foreground">{s.body}</p>
            </div>
            <span className="mt-auto text-[13px] font-bold text-primary">{s.cta} →</span>
          </Link>
        ))}
      </section>
    </div>
  );
}

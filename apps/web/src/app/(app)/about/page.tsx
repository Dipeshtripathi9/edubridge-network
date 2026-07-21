import Link from 'next/link';
import {
  Award,
  BadgeCheck,
  BookOpen,
  Briefcase,
  Code2,
  Compass,
  Cpu,
  FlaskConical,
  Globe,
  GraduationCap,
  Headphones,
  Heart,
  MapPin,
  MessageCircle,
  PenTool,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ARC = (
  <svg className="absolute -bottom-2 left-0 h-3 w-full text-marigold" viewBox="0 0 300 20" preserveAspectRatio="none" aria-hidden>
    <path d="M4 16 C 80 2, 220 2, 296 16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
  </svg>
);

function Eyebrow({ children, marigold }: { children: React.ReactNode; marigold?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-mono text-[11.5px] font-medium uppercase tracking-[2.8px]', marigold ? 'text-marigold' : 'text-primary')}>
      <span className="h-0.5 w-[22px] rounded-full bg-marigold" /> {children}
    </span>
  );
}

const OFFERS = [
  { icon: Award, tone: 'bg-marigold-soft text-amber-600', title: 'Scholarships', body: 'From government, private organisations and global institutions.' },
  { icon: Briefcase, tone: 'bg-accent text-primary', title: 'Internships', body: 'From leading companies, startups and government organisations.' },
  { icon: Trophy, tone: 'bg-marigold-soft text-amber-600', title: 'Hackathons & competitions', body: 'Coding challenges, contests and competitions.' },
  { icon: FlaskConical, tone: 'bg-green-soft text-green', title: 'Research programs', body: 'Research internships and innovation programs.' },
  { icon: Rocket, tone: 'bg-accent text-primary', title: 'Startup opportunities', body: 'Grants, incubation and entrepreneurship programs.' },
  { icon: BadgeCheck, tone: 'bg-green-soft text-green', title: 'Free certifications', body: 'Certifications and skill-development programs.' },
  { icon: Globe, tone: 'bg-accent text-primary', title: 'Fellowships & study abroad', body: 'Fellowships, study-abroad and exchange programs.' },
  { icon: Star, tone: 'bg-marigold-soft text-amber-600', title: 'Honest reviews', body: 'Placements, campus life and academic insights.' },
  { icon: MessageCircle, tone: 'bg-accent text-primary', title: 'Discussions & Q&A', body: 'Student discussions, doubts and peer support.' },
  { icon: Sparkles, tone: 'bg-green-soft text-green', title: 'Personal recommendations', body: 'Guidance based on each student’s profile, interests and goals.' },
];

const TEAM = [
  { icon: Code2, title: 'Software Engineers', body: 'Building a secure, scalable, AI-powered platform.' },
  { icon: PenTool, title: 'UI / UX Designers', body: 'Creating an intuitive student experience.' },
  { icon: Cpu, title: 'AI & Data Specialists', body: 'Developing personalised recommendations.' },
  { icon: BookOpen, title: 'Content & Research', body: 'Verifying scholarships, internships, competitions and resources.' },
  { icon: MapPin, title: 'Campus Ambassadors', body: 'Representing colleges across India.' },
  { icon: ShieldCheck, title: 'Trust & Safety', body: 'Keeping the platform respectful, safe and authentic.' },
  { icon: TrendingUp, title: 'Marketing & Partnerships', body: 'Collaborating with universities, startups and employers.' },
  { icon: Headphones, title: 'Student Support', body: 'Helping users discover the right opportunities.' },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-14 sm:space-y-20">
      {/* Hero */}
      <section className="pt-2">
        <Eyebrow>About EduBridge Network</Eyebrow>
        <h1 className="mt-3 max-w-[880px] font-display text-[clamp(30px,5.2vw,52px)] font-extrabold leading-[1.06] tracking-[-.026em]">
          India&apos;s student-first bridge — from <span className="relative inline-block text-primary">admission to career.{ARC}</span>
        </h1>
        <p className="mt-4 max-w-[620px] text-[16.5px] text-muted-foreground">
          EduBridge Network helps students make informed decisions from college admission to career success — with verified opportunities, authentic college insights, and trusted expert guidance.
        </p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {[
            { icon: GraduationCap, tone: 'text-primary', v: '70+', l: 'verified colleges' },
            { icon: ShieldCheck, tone: 'text-green', v: '200+', l: 'verified students' },
            { icon: Target, tone: 'text-marigold', v: '1', l: 'trusted platform' },
          ].map((s) => (
            <span key={s.l} className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-[13px] font-bold text-muted-foreground shadow-sm">
              <s.icon className={cn('h-[15px] w-[15px]', s.tone)} /> <b className="font-display text-foreground">{s.v}</b> {s.l}
            </span>
          ))}
        </div>
      </section>

      {/* Problem → solution */}
      <section className="grid gap-6 rounded-3xl border border-border bg-card p-6 sm:p-10 lg:grid-cols-2 lg:gap-12">
        <div>
          <Eyebrow>The problem</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(22px,3.6vw,32px)] font-extrabold leading-[1.1] tracking-[-.02em]">
            Talent is everywhere. <span className="text-primary">Opportunity isn&apos;t.</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            Every year, millions of students struggle to find reliable information about colleges, scholarships, internships, hackathons, research and placements. Most of it is scattered across WhatsApp groups, Telegram channels and social media — hard to discover and harder to trust.
          </p>
        </div>
        <div className="flex flex-col justify-center gap-4 rounded-3xl bg-accent/50 p-6 sm:p-8">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-white"><Compass className="h-6 w-6" /></span>
          <p className="font-display text-[19px] font-bold leading-snug tracking-tight">
            EduBridge Network brings everything together on one verified platform.
          </p>
          <p className="text-[14.5px] text-muted-foreground">
            Our mission is to empower every student with equal access to opportunities, authentic college insights, and guidance that helps them grow — regardless of their background or college.
          </p>
        </div>
      </section>

      {/* What we offer */}
      <section>
        <div className="mb-10 max-w-[640px]">
          <Eyebrow>What we offer</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(24px,4vw,38px)] font-extrabold leading-[1.08] tracking-[-.024em]">
            Everything a student needs, <span className="text-primary">in one place.</span>
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {OFFERS.map((o) => (
            <div key={o.title} className="flex gap-4 rounded-3xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <span className={cn('grid h-11 w-11 flex-none place-items-center rounded-[14px]', o.tone)}><o.icon className="h-[21px] w-[21px]" /></span>
              <div>
                <h3 className="font-display text-[16px] font-bold tracking-tight">{o.title}</h3>
                <p className="mt-1 text-[13.5px] text-muted-foreground">{o.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border bg-card p-7 sm:p-9">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-primary"><Compass className="h-6 w-6" /></span>
          <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight">Our vision</h3>
          <p className="mt-2 text-muted-foreground">
            To become India&apos;s most trusted student network — where every learner can discover opportunities, build meaningful connections, and achieve their academic and career aspirations, regardless of background or college.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-violet-deep p-7 text-white sm:p-9">
          <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(60% 70% at 85% 10%, rgba(90,49,244,.5), transparent 62%), radial-gradient(40% 46% at 4% 96%, rgba(242,163,27,.16), transparent 60%)' }} />
          <div className="relative">
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-white/15 bg-white/10 text-marigold"><Target className="h-6 w-6" /></span>
            <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight">Our mission</h3>
            <p className="mt-2 text-[#C9C1EE]">
              To organise educational opportunities and student knowledge into one accessible, verified platform that helps students learn, connect and succeed.
            </p>
          </div>
        </div>
      </section>

      {/* Why EduBridge */}
      <section className="rounded-3xl border border-border bg-card p-6 text-center sm:p-12">
        <Eyebrow>Why EduBridge Network</Eyebrow>
        <p className="mx-auto mt-5 max-w-[760px] font-display text-[clamp(20px,3.2vw,28px)] font-semibold leading-[1.4] tracking-[-.015em]">
          We believe talent exists everywhere, but opportunities do not. EduBridge Network bridges that gap — making verified opportunities, trusted college information and real student experiences accessible to <span className="bg-[linear-gradient(transparent_62%,hsl(var(--marigold-soft))_62%)]">everyone</span>.
        </p>
        <p className="mx-auto mt-6 font-display text-lg font-bold text-primary">From Choosing Your Future to Building Your Career.</p>
      </section>

      {/* Team */}
      <section>
        <div className="mb-10 max-w-[640px]">
          <Eyebrow>Our team</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(24px,4vw,38px)] font-extrabold leading-[1.08] tracking-[-.024em]">
            Built by students, <span className="text-primary">for students.</span>
          </h2>
          <p className="mt-3 text-muted-foreground">
            A team of students, developers, designers, researchers and mentors who understand the challenges students face — because we&apos;ve lived them. United by one goal: making quality education, opportunities and career guidance accessible to every student.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {TEAM.map((t) => (
            <div key={t.title} className="rounded-3xl border border-border bg-card p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
              <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-accent text-primary"><t.icon className="h-[21px] w-[21px]" /></span>
              <h3 className="mt-4 font-display text-[15.5px] font-bold tracking-tight">{t.title}</h3>
              <p className="mt-1.5 text-[13.5px] text-muted-foreground">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-[32px] bg-primary px-6 py-14 text-center text-white sm:px-12 sm:py-16">
        <div aria-hidden className="pointer-events-none absolute inset-0" style={{ backgroundImage: 'radial-gradient(46% 60% at 88% 0%, rgba(255,255,255,.16), transparent 60%), radial-gradient(40% 55% at 4% 100%, rgba(36,18,99,.5), transparent 62%)' }} />
        <div className="relative">
          <h2 className="font-display text-[clamp(26px,4.4vw,42px)] font-extrabold leading-[1.08] tracking-[-.025em]">
            Together, we&apos;re building the bridge<br /><span className="text-[#FFD98A]">between education and opportunity.</span>
          </h2>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" className="bg-background text-foreground hover:bg-card"><Link href="/reviews"><Users className="h-4 w-4" /> Explore colleges</Link></Button>
            <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90"><Link href="/internship">Browse opportunities</Link></Button>
          </div>
          <p className="mt-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[#DCD5F7]">
            <Heart className="h-4 w-4 text-marigold" /> Made with love in Delhi NCR
          </p>
        </div>
      </section>
    </div>
  );
}

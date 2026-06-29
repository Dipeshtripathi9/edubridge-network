'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Award,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Headset,
  Rocket,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// To use a real generated photo as the centerpiece, drop the file into
// apps/web/public (e.g. hero-students.png) and set this to its path, e.g.
// '/hero-students.png'. While null, a premium product-UI mock is shown instead.
const HERO_IMAGE: string | null = null;

const CARDS = [
  {
    icon: Headset,
    tone: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    title: '1:1 Expert Guidance',
    desc: 'Talk directly with our verified education experts over call or live chat — personalised counselling for choosing the right course, college, career path, admission, scholarships & future planning.',
  },
  {
    icon: ShieldCheck,
    tone: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    title: 'Real Student Reviews',
    desc: 'Verified reviews from real students on placements, faculty, hostel, campus life, fees, ROI, internships, attendance, culture & academics. No fake reviews — ever.',
  },
  {
    icon: TrendingUp,
    tone: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    title: 'Data-Driven Insights',
    desc: 'Verified college insights from real student data: placement stats, average & highest package, fees, ROI, internships, satisfaction, hostel ratings, infrastructure & faculty — in clean visualisations.',
  },
  {
    icon: Target,
    tone: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    title: 'Personalized Guidance',
    desc: 'Recommendations tailored to each student — course interest, location, marks, budget & category. Our experts connect over call or chat and suggest colleges that fit your profile.',
  },
];

function FloatBadge({ className, delay, children }: { className: string; delay: number; children: React.ReactNode }) {
  return (
    <motion.div
      className={cn(
        'absolute flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background shadow-md',
        className,
      )}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.div>
  );
}

// A small glassmorphism info card that floats over the scene.
function GlassCard({
  className,
  delay,
  icon: Icon,
  tone,
  title,
  subtitle,
}: {
  className: string;
  delay: number;
  icon: typeof ShieldCheck;
  tone: string;
  title: string;
  subtitle: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        'absolute flex max-w-[10.5rem] items-center gap-2 rounded-[18px] border border-white/60 bg-white/80 p-2.5 shadow-[0_20px_50px_rgba(30,41,59,0.12)] backdrop-blur dark:border-white/10 dark:bg-slate-900/70',
        className,
      )}
    >
      <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', tone)}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="leading-tight">
        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{title}</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400">{subtitle}</p>
      </div>
    </motion.div>
  );
}

// The laptop product-UI mock shown when no real photo is provided.
function LaptopMock() {
  return (
    <div className="w-[58%]">
      {/* screen */}
      <div className="rounded-xl border border-slate-200 bg-white p-2.5 shadow-xl dark:border-slate-700 dark:bg-slate-800">
        <div className="mb-2 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span className="ml-1.5 rounded-full bg-indigo-100 px-1.5 text-[8px] font-semibold text-indigo-600 dark:bg-indigo-500/20">
            EduBridge Network
          </span>
        </div>
        {/* college row */}
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 p-1.5 dark:bg-slate-700/50">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
            <GraduationCap className="h-4 w-4" />
          </span>
          <div className="flex-1">
            <div className="h-1.5 w-16 rounded-full bg-slate-300 dark:bg-slate-500" />
            <div className="mt-1 flex items-center gap-0.5">
              {[0, 1, 2, 3].map((i) => (
                <Star key={i} className="h-2 w-2 fill-amber-400 text-amber-400" />
              ))}
              <Star className="h-2 w-2 text-slate-300" />
            </div>
          </div>
          <span className="flex items-center gap-0.5 rounded-full bg-emerald-100 px-1 py-0.5 text-[8px] font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
            <CheckCircle2 className="h-2.5 w-2.5" /> Verified
          </span>
        </div>
        {/* mini chart */}
        <div className="mt-2 flex items-end gap-1 rounded-lg bg-slate-50 p-2 dark:bg-slate-700/50">
          {[40, 65, 50, 80, 70].map((h, i) => (
            <motion.span
              key={i}
              initial={{ height: 0 }}
              whileInView={{ height: `${h}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1 }}
              className="w-full rounded-sm bg-gradient-to-t from-indigo-500 to-blue-400"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
        <div className="mt-1.5 flex justify-between text-[8px] text-slate-500 dark:text-slate-400">
          <span>Placements ↑</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">Avg ₹12 LPA</span>
        </div>
      </div>
      {/* base */}
      <div className="mx-auto h-1.5 w-[112%] -translate-x-[5%] rounded-b-lg bg-gradient-to-b from-slate-300 to-slate-400 dark:from-slate-600 dark:to-slate-700" />
    </div>
  );
}

function HeroScene() {
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950/40">
      {/* abstract SaaS background */}
      <svg className="absolute inset-0 h-full w-full text-indigo-300/40 dark:text-indigo-500/20" fill="none">
        <defs>
          <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dots)" />
        <path d="M30 60 Q 140 20 250 90" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <path d="M40 220 Q 160 260 300 200" stroke="currentColor" strokeWidth="1.5" fill="none" />
        <polyline points="20,180 70,140 120,160 170,110 220,130" stroke="currentColor" strokeWidth="1.5" fill="none" />
      </svg>
      <div className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-indigo-400/10 blur-2xl" />
      <div className="absolute -right-4 bottom-6 h-28 w-28 rounded-full bg-emerald-400/10 blur-2xl" />

      {/* centerpiece: real photo if provided, else laptop mock */}
      <div className="absolute inset-0 flex items-center justify-center">
        {HERO_IMAGE ? (
          <Image src={HERO_IMAGE} alt="EduBridge students" fill className="object-cover" sizes="(max-width:768px) 100vw, 28rem" />
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex w-full justify-center"
          >
            <LaptopMock />
          </motion.div>
        )}
      </div>

      {/* floating glassmorphism cards */}
      <GlassCard
        className="left-2 top-3"
        delay={0.1}
        icon={ShieldCheck}
        tone="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
        title="Expert Counselors"
        subtitle="Personalized Guidance"
      />
      <GlassCard
        className="bottom-3 left-2"
        delay={0.25}
        icon={ShieldCheck}
        tone="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        title="Real Student Reviews"
        subtitle="Verified & Authentic"
      />
      <GlassCard
        className="bottom-12 right-2"
        delay={0.4}
        icon={Sparkles}
        tone="bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
        title="Best Opportunities"
        subtitle="Scholarships & Internships"
      />

      {/* small floating icons */}
      <FloatBadge className="right-3 top-4" delay={0.2}>
        <Award className="h-4 w-4 text-rose-500" />
      </FloatBadge>
      <FloatBadge className="right-16 top-14" delay={0.9}>
        <TrendingUp className="h-4 w-4 text-blue-600" />
      </FloatBadge>
      <FloatBadge className="left-20 bottom-16" delay={1.3}>
        <Users className="h-4 w-4 text-indigo-600" />
      </FloatBadge>
      <FloatBadge className="left-1/2 top-1 -translate-x-1/2" delay={0.6}>
        <Briefcase className="h-4 w-4 text-amber-600" />
      </FloatBadge>
      <FloatBadge className="right-20 bottom-2" delay={1.0}>
        <Rocket className="h-4 w-4 text-indigo-600" />
      </FloatBadge>
    </div>
  );
}

export function ExpertGuidance() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-accent/20 p-6 shadow-sm sm:p-8"
    >
      <p className="text-sm font-medium text-primary">
        Make informed decisions for your future with experts &amp; verified students.
      </p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight">Why EduBridge Network</h2>

      <div className="mt-6 grid gap-8 lg:grid-cols-2 lg:items-center">
        {/* cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {CARDS.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group rounded-3xl border border-border bg-background/70 p-5 backdrop-blur transition-shadow hover:shadow-lg"
            >
              <span className={cn('mb-3 flex h-12 w-12 items-center justify-center rounded-full', c.tone)}>
                <c.icon className="h-6 w-6" />
              </span>
              <h3 className="font-semibold">{c.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* hero scene */}
        <HeroScene />
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Real experts, verified student reviews &amp; real data — not AI-generated predictions. After admission, unlock
        scholarships, internships &amp; personal-growth opportunities.
      </p>
    </motion.section>
  );
}

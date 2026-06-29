'use client';

import { motion } from 'framer-motion';
import {
  Award,
  BarChart3,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Headset,
  Laptop,
  MessageCircle,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

// Small floating icon badge used around the illustration.
function FloatBadge({
  className,
  delay,
  children,
}: {
  className: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={cn(
        'absolute flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background shadow-lg',
        className,
      )}
      animate={{ y: [0, -9, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay }}
    >
      {children}
    </motion.div>
  );
}

function Illustration() {
  return (
    <div className="relative mx-auto h-80 w-full max-w-sm">
      {/* glow */}
      <div className="absolute inset-6 rounded-[2rem] bg-gradient-to-br from-indigo-500/20 via-blue-500/10 to-emerald-500/20 blur-2xl" />
      {/* central student card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="absolute left-1/2 top-1/2 flex h-44 w-56 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-3 rounded-[1.75rem] border border-border bg-card shadow-xl"
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
          <Laptop className="h-8 w-8" />
        </span>
        <div className="space-y-1 text-center">
          <div className="mx-auto h-2 w-24 rounded-full bg-muted" />
          <div className="mx-auto h-2 w-16 rounded-full bg-muted" />
        </div>
      </motion.div>

      {/* floating badges */}
      <FloatBadge className="left-0 top-4" delay={0}>
        <GraduationCap className="h-5 w-5 text-indigo-600" />
      </FloatBadge>
      <FloatBadge className="right-1 top-10" delay={0.6}>
        <BarChart3 className="h-5 w-5 text-blue-600" />
      </FloatBadge>
      <FloatBadge className="left-2 bottom-10" delay={1.1}>
        <MessageCircle className="h-5 w-5 text-emerald-600" />
      </FloatBadge>
      <FloatBadge className="right-0 bottom-4" delay={0.3}>
        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
      </FloatBadge>
      <FloatBadge className="left-1/2 top-0 -translate-x-1/2" delay={1.4}>
        <Award className="h-5 w-5 text-rose-500" />
      </FloatBadge>
      <FloatBadge className="right-8 bottom-0" delay={0.9}>
        <Briefcase className="h-5 w-5 text-amber-600" />
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

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
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

        {/* illustration */}
        <Illustration />
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Real experts, verified student reviews &amp; real data — not AI-generated predictions. After admission, unlock
        scholarships, internships &amp; personal-growth opportunities.
      </p>
    </motion.section>
  );
}

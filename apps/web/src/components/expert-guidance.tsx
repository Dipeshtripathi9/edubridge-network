'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  Headset,
  Phone,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useSubmitMentorRequest } from '@/hooks/use-mentors';
import { cn } from '@/lib/utils';

// To use a real generated photo as the centerpiece, drop the file into
// apps/web/public (e.g. hero-students.png) and set this to its path, e.g.
// '/hero-students.png'. While null, the premium product collage is shown.
const HERO_IMAGE: string | null = '/hero-students.jpg';

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

function Float({ children, className, delay = 0, rotate = 0 }: { children: React.ReactNode; className: string; delay?: number; rotate?: number }) {
  return (
    <motion.div
      className={cn('absolute', className)}
      initial={{ opacity: 0, y: 14, rotate }}
      whileInView={{ opacity: 1, y: 0, rotate }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay }}
    >
      <motion.div animate={{ y: [0, -7, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Pill({ icon: Icon, label, tone, className, delay }: { icon: typeof Award; label: string; tone: string; className: string; delay: number }) {
  return (
    <Float className={className} delay={delay}>
      <div className="flex items-center gap-1.5 rounded-full border border-white/60 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-900/80 dark:text-slate-200">
        <Icon className={cn('h-3.5 w-3.5', tone)} /> {label}
      </div>
    </Float>
  );
}

function ProductCollage() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md">
      {/* gradient mesh + dotted nodes */}
      <div className="absolute inset-0 overflow-hidden rounded-[2rem]">
        <div className="absolute -left-8 -top-8 h-44 w-44 rounded-full bg-indigo-500/25 blur-3xl" />
        <div className="absolute -right-6 top-12 h-40 w-40 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl" />
        <svg className="absolute inset-0 h-full w-full text-indigo-400/30 dark:text-indigo-400/15" fill="none">
          <defs>
            <pattern id="eg-dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.3" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#eg-dots)" />
          <path d="M60 80 Q 180 40 300 120" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 5" fill="none" />
          <path d="M50 260 Q 180 300 320 230" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 5" fill="none" />
        </svg>
      </div>

      {/* back: college insights dashboard (real data) */}
      <Float className="left-3 top-6 w-60" delay={0.1} rotate={-5}>
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
          <div className="mb-2 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-100">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-indigo-500 to-blue-600 text-white">
                <GraduationCap className="h-3.5 w-3.5" />
              </span>
              College Insights
            </span>
            <span className="flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              <CheckCircle2 className="h-2.5 w-2.5" /> Verified
            </span>
          </div>
          <div className="flex items-end gap-1.5 rounded-lg bg-slate-50 p-2 dark:bg-slate-700/50">
            {[45, 70, 55, 85, 75, 95].map((h, i) => (
              <motion.span
                key={i}
                initial={{ height: 4 }}
                whileInView={{ height: `${h}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + i * 0.08 }}
                style={{ height: `${h}%` }}
                className="w-full rounded-sm bg-gradient-to-t from-indigo-500 to-blue-400"
              />
            ))}
          </div>
          <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
            {[['92%', 'Placed'], ['₹12L', 'Avg pkg'], ['4.6★', 'Rating']].map(([v, l]) => (
              <div key={l} className="rounded-md bg-slate-50 py-1 dark:bg-slate-700/50">
                <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{v}</p>
                <p className="text-[8px] text-slate-500 dark:text-slate-400">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </Float>

      {/* front: expert guidance chat */}
      <Float className="bottom-6 left-1 w-52" delay={0.35} rotate={4}>
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-2xl backdrop-blur dark:border-slate-700 dark:bg-slate-800/95">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
              <Headset className="h-4 w-4" />
            </span>
            <div>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100">Expert Counselor</p>
              <p className="flex items-center gap-1 text-[9px] text-emerald-600">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online now
              </p>
            </div>
          </div>
          <div className="mt-2 space-y-1.5">
            <p className="ml-auto w-fit rounded-2xl rounded-br-sm bg-indigo-600 px-2.5 py-1 text-[10px] text-white">Which course suits me?</p>
            <p className="w-fit rounded-2xl rounded-bl-sm bg-slate-100 px-2.5 py-1 text-[10px] text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              Based on your marks & budget — here are 3 great fits 👇
            </p>
          </div>
        </div>
      </Float>

      {/* verified student review */}
      <Float className="right-1 top-2 w-48" delay={0.5} rotate={5}>
        <div className="rounded-2xl border border-emerald-200 bg-white/95 p-3 shadow-2xl backdrop-blur dark:border-emerald-500/30 dark:bg-slate-800/95">
          <div className="flex items-center gap-1.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-[10px] font-bold text-white">A</span>
            <div className="flex-1">
              <div className="flex items-center gap-0.5">
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="flex items-center gap-0.5 text-[8px] font-semibold text-emerald-600">
                <ShieldCheck className="h-2.5 w-2.5" /> Verified student
              </p>
            </div>
          </div>
          <p className="mt-1.5 flex gap-1 text-[10px] leading-snug text-slate-600 dark:text-slate-300">
            <Quote className="h-3 w-3 shrink-0 text-slate-300" /> Great placements & honest faculty. Hostel could be better.
          </p>
        </div>
      </Float>

      {/* opportunity pills */}
      <Pill icon={Award} label="Scholarships" tone="text-rose-500" className="right-2 bottom-20" delay={0.7} />
      <Pill icon={Briefcase} label="Internships" tone="text-amber-600" className="right-6 bottom-8" delay={0.9} />
      <Pill icon={Sparkles} label="Growth" tone="text-indigo-600" className="left-1/2 top-1 -translate-x-1/2" delay={1.1} />
    </div>
  );
}

// Real photo as the centerpiece, with premium floating SaaS cards overlaid.
function PhotoScene() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[2rem] border border-border shadow-xl">
      <Image src={HERO_IMAGE as string} alt="Students choosing their college with EduBridge" fill className="object-cover transition dark:brightness-[0.82]" sizes="(max-width:768px) 100vw, 28rem" priority />
      {/* legibility gradient — a touch stronger in dark mode so the photo doesn't glare */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/45 via-transparent to-indigo-900/15 dark:from-slate-950/65 dark:via-slate-950/10 dark:to-slate-950/30" />

      {/* expert-online chip */}
      <Float className="left-3 top-3" delay={0.2}>
        <div className="flex items-center gap-1.5 rounded-2xl border border-white/60 bg-white/85 px-2.5 py-1.5 shadow-lg backdrop-blur dark:bg-slate-900/80">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
            <Headset className="h-3.5 w-3.5" />
          </span>
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100">Expert Counselor</p>
            <p className="flex items-center gap-1 text-[9px] text-emerald-600"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online now</p>
          </div>
        </div>
      </Float>

      {/* verified review chip */}
      <Float className="bottom-3 left-3" delay={0.4}>
        <div className="flex items-center gap-1.5 rounded-2xl border border-emerald-300/70 bg-white/85 px-2.5 py-1.5 shadow-lg backdrop-blur dark:bg-slate-900/80">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
          <div className="leading-tight">
            <div className="flex items-center gap-0.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star key={i} className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <p className="text-[9px] font-semibold text-slate-600 dark:text-slate-300">Verified student reviews</p>
          </div>
        </div>
      </Float>

      {/* data chip */}
      <Float className="right-3 top-3" delay={0.55}>
        <div className="flex items-center gap-1.5 rounded-2xl border border-white/60 bg-white/85 px-2.5 py-1.5 shadow-lg backdrop-blur dark:bg-slate-900/80">
          <TrendingUp className="h-4 w-4 text-indigo-600" />
          <div className="leading-tight">
            <p className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">₹12L avg</p>
            <p className="text-[9px] text-slate-500 dark:text-slate-400">Real placement data</p>
          </div>
        </div>
      </Float>

      {/* opportunity pills */}
      <Pill icon={Award} label="Scholarships" tone="text-rose-500" className="right-3 bottom-14" delay={0.7} />
      <Pill icon={Briefcase} label="Internships" tone="text-amber-600" className="right-6 bottom-4" delay={0.9} />
    </div>
  );
}

function HeroScene() {
  return HERO_IMAGE ? <PhotoScene /> : <ProductCollage />;
}

function GuidanceForm({ onDone }: { onDone: () => void }) {
  const submit = useSubmitMentorRequest();
  const [f, setF] = useState({
    name: '', phone: '', email: '', course: '', location: '', marks: '', budget: '', category: '', preferredCollege: '', contactMethod: 'CALL', message: '',
  });
  const set = (k: keyof typeof f, v: string) => setF((c) => ({ ...c, [k]: v }));

  const onSubmit = () => {
    if (!f.name.trim() || !f.phone.trim()) {
      toast.error('Please add your name and phone number');
      return;
    }
    submit.mutate(
      { ...f, contactMethod: f.contactMethod as 'CALL' | 'CHAT' },
      {
        onSuccess: () => {
          toast.success('Request sent! Our expert will reach out to guide you.');
          onDone();
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-4 overflow-hidden rounded-2xl border border-primary/30 bg-background/70 p-5 backdrop-blur"
    >
      <p className="mb-3 text-sm font-medium">Tell us about you — our expert will call or chat with personalised guidance.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input placeholder="Your name *" value={f.name} onChange={(e) => set('name', e.target.value)} />
        <Input placeholder="Phone / WhatsApp *" value={f.phone} onChange={(e) => set('phone', e.target.value)} />
        <Input placeholder="Email (optional)" value={f.email} onChange={(e) => set('email', e.target.value)} />
        <Input placeholder="Course interest (e.g. B.Tech CSE)" value={f.course} onChange={(e) => set('course', e.target.value)} />
        <Input placeholder="Preferred location" value={f.location} onChange={(e) => set('location', e.target.value)} />
        <Input placeholder="Marks / percentage" value={f.marks} onChange={(e) => set('marks', e.target.value)} />
        <Input placeholder="Budget (₹ / year)" value={f.budget} onChange={(e) => set('budget', e.target.value)} />
        <Input placeholder="Category (optional)" value={f.category} onChange={(e) => set('category', e.target.value)} />
        <Input placeholder="Preferred college (optional)" value={f.preferredCollege} onChange={(e) => set('preferredCollege', e.target.value)} />
        <select
          value={f.contactMethod}
          onChange={(e) => set('contactMethod', e.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
        >
          <option value="CALL">Contact me by call</option>
          <option value="CHAT">Contact me by chat</option>
        </select>
      </div>
      <Textarea
        className="mt-2"
        placeholder="Anything else we should know? (optional)"
        value={f.message}
        onChange={(e) => set('message', e.target.value)}
      />
      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" onClick={onDone}>Cancel</Button>
        <Button size="sm" onClick={onSubmit} disabled={submit.isPending}>
          Request guidance <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </motion.div>
  );
}

const TRUST = ['Verified students', 'Real college data', 'No AI predictions'];

export function ExpertGuidance() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5 }}
      className="rounded-3xl border border-border bg-gradient-to-br from-card to-accent/20 p-5 shadow-sm sm:p-8"
    >
      {/* Hero */}
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Experts &amp; verified students
          </span>
          <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight [text-wrap:balance] sm:text-3xl lg:text-4xl">
            Choose the right course.{' '}
            <br className="hidden sm:block" />
            Find the right college.{' '}
            <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">
              Build the right future.
            </span>
          </h2>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Expert guidance, verified student reviews and real college insights help you decide with confidence — and
            after admission we keep supporting you with scholarships, internships, communities &amp; career
            opportunities.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {!open && (
              <Button size="lg" onClick={() => (loggedIn ? setOpen(true) : router.push('/login?next=/home'))}>
                <Phone className="h-4 w-4" /> Get Expert Guidance
              </Button>
            )}
            <Button asChild size="lg" variant="outline">
              <Link href="/communities">Explore Communities</Link>
            </Button>
          </div>

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
            {TRUST.map((t) => (
              <span key={t} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* hero scene */}
        <HeroScene />
      </div>

      {open && <GuidanceForm onDone={() => setOpen(false)} />}

      {/* Feature cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
    </motion.section>
  );
}

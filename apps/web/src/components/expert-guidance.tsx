'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, GraduationCap, Phone, ShieldCheck, Star, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { MotionProvider, m } from '@/components/motion';
import { useSubmitMentorRequest } from '@/hooks/use-mentors';
import { cn } from '@/lib/utils';

const TRUST = ['Verified students', 'Real college data', 'No AI predictions'];

// The three verified-data bars in the proof card (label, value, width, gold?).
const BARS: { label: string; value: string; w: string; gold?: boolean }[] = [
  { label: 'Avg package', value: '₹8.2 L', w: '64%' },
  { label: 'Highest package', value: '₹52 L', w: '90%', gold: true },
  { label: 'Placement rate', value: '92%', w: '92%' },
];

/** Floating glass chip around the proof card — gently bobs up and down. */
function Chip({
  className,
  delay,
  children,
}: {
  className: string;
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <m.div
      animate={{ y: [0, -9, 0] }}
      transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay }}
      className={cn(
        'absolute z-10 flex items-center gap-2.5 rounded-2xl border border-border bg-card px-3.5 py-2.5 shadow-[0_2px_4px_rgba(26,20,51,.06),0_20px_44px_-18px_rgba(36,18,99,.24)]',
        className,
      )}
    >
      {children}
    </m.div>
  );
}

// The verified-college insight card + four floating proof chips.
function ProofCollage() {
  return (
    <div className="relative mx-auto aspect-[10/10.6] w-full max-w-[460px]">
      {/* Center: Bennett insight card */}
      <div className="absolute inset-x-[8%] bottom-[14%] top-[16%] flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-[0_2px_4px_rgba(26,20,51,.06),0_20px_44px_-18px_rgba(36,18,99,.24)]">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 flex-none place-items-center rounded-[14px] bg-accent text-primary">
            <GraduationCap className="h-[22px] w-[22px]" />
          </span>
          <div className="leading-tight">
            <b className="block font-display text-[16.5px] font-bold tracking-tight">Bennett University</b>
            <span className="text-xs font-semibold text-muted-foreground">B.Tech CSE · Greater Noida</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center gap-3.5">
          {BARS.map((b, i) => (
            <div key={b.label} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>{b.label}</span>
                <b className="font-mono text-xs text-foreground">{b.value}</b>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-secondary">
                <m.span
                  initial={{ width: 0 }}
                  animate={{ width: b.w }}
                  transition={{ duration: 1.1, delay: 0.2 + i * 0.12, ease: [0.2, 0.7, 0.2, 1] }}
                  className={cn(
                    'block h-full rounded-full',
                    b.gold
                      ? 'bg-gradient-to-r from-marigold to-amber-300'
                      : 'bg-gradient-to-r from-primary to-violet-400',
                  )}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-green-soft px-3 py-2.5 text-xs font-semibold text-green">
          <ShieldCheck className="h-4 w-4 flex-none" />
          Data from 47 verified Bennett students
        </div>
      </div>

      {/* Floating chips */}
      <Chip className="left-[-2%] top-[2%]" delay={0.2}>
        <span className="h-2 w-2 flex-none rounded-full bg-green shadow-[0_0_0_4px_rgba(14,138,92,.16)]" />
        <span className="text-[13px] font-bold leading-tight">
          Expert counselor
          <small className="block text-[11px] font-semibold text-muted-foreground">Online now</small>
        </span>
      </Chip>
      <Chip className="right-[-3%] top-[6%]" delay={1.4}>
        <TrendingUp className="h-4 w-4 flex-none text-primary" />
        <span className="text-[13px] font-bold leading-tight">
          ₹12L avg
          <small className="block text-[11px] font-semibold text-muted-foreground">Real placement data</small>
        </span>
      </Chip>
      <Chip className="bottom-[4%] left-[-3%]" delay={0.8}>
        <span className="text-[13px] tracking-wide text-marigold">★★★★★</span>
        <span className="text-[13px] font-bold leading-tight">
          4.8
          <small className="block text-[11px] font-semibold text-muted-foreground">Verified student reviews</small>
        </span>
      </Chip>
      <Chip className="bottom-[1%] right-0" delay={2}>
        <Star className="h-4 w-4 flex-none text-marigold" />
        <span className="text-[13px] font-bold leading-tight">
          Scholarships + internships
          <small className="block text-[11px] font-semibold text-muted-foreground">Even after admission</small>
        </span>
      </Chip>
    </div>
  );
}

export function GuidanceForm({ onDone }: { onDone: () => void }) {
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
    <m.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-5 overflow-hidden rounded-2xl border border-primary/30 bg-background/70 p-5 backdrop-blur"
    >
      <p className="mb-3 text-sm font-medium">Tell us about you — our expert will call or chat with personalised guidance.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Input placeholder="Your name *" value={f.name} onChange={(e) => set('name', e.target.value)} />
        <Input placeholder="Phone / WhatsApp *" value={f.phone} onChange={(e) => set('phone', e.target.value)} />
        <Input placeholder="Email (optional)" value={f.email} onChange={(e) => set('email', e.target.value)} />
        <Input placeholder="Course interest (e.g. B.Tech CSE)" value={f.course} onChange={(e) => set('course', e.target.value)} />
        <Input placeholder="Preferred location" value={f.location} onChange={(e) => set('location', e.target.value)} />
        <Input
          placeholder="Marks & rank — e.g. 92% class 12, 30k JEE Mains / NEET, or none"
          value={f.marks}
          onChange={(e) => set('marks', e.target.value)}
        />
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
    </m.div>
  );
}

export function ExpertGuidance() {
  const [open, setOpen] = useState(false);
  return (
    <MotionProvider>
      <section
        id="get-expert-guidance"
        className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-card to-accent/30 p-5 shadow-sm sm:p-8 lg:p-10"
      >
        {/* soft brand glows */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            backgroundImage:
              'radial-gradient(50% 60% at 78% 12%, hsl(var(--primary)/.10), transparent 62%), radial-gradient(44% 52% at 6% 66%, hsl(var(--marigold)/.12), transparent 60%)',
          }}
        />
        <div className="grid items-center gap-8 lg:grid-cols-[1.05fr_.95fr]">
          {/* Text column */}
          <div>
            <span className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-card py-2 pl-2 pr-4 text-[13.5px] font-semibold text-muted-foreground shadow-sm">
              <span className="grid h-6 w-6 place-items-center rounded-full bg-accent text-primary">
                <GraduationCap className="h-3.5 w-3.5" />
              </span>
              70+ verified colleges · Delhi NCR
            </span>

            <h1 className="font-display text-[clamp(30px,6vw,52px)] font-extrabold leading-[1.04] tracking-[-.028em]">
              <span className="block">Choose the right course.</span>
              <span className="block">Find the right college.</span>
              <span className="relative inline-block text-primary">
                Build the right future.
                <svg
                  className="absolute -bottom-2 left-0 h-3.5 w-full text-marigold"
                  viewBox="0 0 300 20"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path d="M4 16 C 80 2, 220 2, 296 16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" fill="none" />
                </svg>
              </span>
            </h1>

            <p className="mt-6 max-w-[490px] text-[17px] text-muted-foreground">
              Not sure which course or college is right for you? Decide with confidence — <b className="font-bold text-foreground">real experts</b>, verified student reviews and actual placement data. And after admission, we stay with you: scholarships, internships &amp; career support.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              {!open && (
                <Button size="lg" onClick={() => setOpen(true)}>
                  <Phone className="h-4 w-4" /> Get expert guidance
                </Button>
              )}
              <Button asChild size="lg" variant="outline">
                <Link href="/opportunities">Explore opportunities</Link>
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {TRUST.map((t) => (
                <span key={t} className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
                  <CheckCircle2 className="h-[17px] w-[17px] text-green" /> {t}
                </span>
              ))}
            </div>

            {open && <GuidanceForm onDone={() => setOpen(false)} />}
          </div>

          {/* Proof collage */}
          <ProofCollage />
        </div>
      </section>
    </MotionProvider>
  );
}

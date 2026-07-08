'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Download, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useSubmitMentorRequest } from '@/hooks/use-mentors';
import { cn } from '@/lib/utils';

type Opt = { val: string; label: string };
type QStep = { kicker: string; title: string; hint?: string; key: string; multi?: boolean; max?: number; opts: Opt[] };

const STEPS: QStep[] = [
  {
    kicker: 'About you · 1 of 4', key: 'stage', title: 'Where are you right now?',
    opts: [
      { val: 'class12_appearing', label: 'Class 12 — appearing' },
      { val: 'class12_passed', label: 'Class 12 — passed' },
      { val: 'drop_year', label: 'Drop year — preparing' },
      { val: 'transfer', label: 'In college — want to transfer' },
    ],
  },
  {
    kicker: 'About you · 2 of 4', key: 'stream', title: 'Your stream in Class 12?',
    opts: [
      { val: 'pcm', label: 'Science — PCM' },
      { val: 'pcb', label: 'Science — PCB' },
      { val: 'commerce', label: 'Commerce' },
      { val: 'arts', label: 'Arts / Humanities' },
    ],
  },
  {
    kicker: 'About you · 3 of 4', key: 'marks', title: 'Your 12th % (or expected)?',
    opts: [
      { val: '90plus', label: '90% +' },
      { val: '80_90', label: '80 – 90%' },
      { val: '70_80', label: '70 – 80%' },
      { val: 'below70', label: 'Below 70%' },
    ],
  },
  {
    kicker: 'About you · 4 of 4', key: 'exams', title: "Entrance exams you've taken or plan to?", hint: 'Select all that apply', multi: true,
    opts: [
      { val: 'jee', label: 'JEE Main' },
      { val: 'cuet', label: 'CUET' },
      { val: 'neet', label: 'NEET' },
      { val: 'university_test', label: "University's own test" },
      { val: 'none_yet', label: 'None yet' },
    ],
  },
  {
    kicker: 'Your college · 1 of 8', key: 'courses', title: 'Which courses interest you?', hint: 'Select up to 2', multi: true, max: 2,
    opts: [
      { val: 'btech_cse', label: 'B.Tech — CSE / IT' },
      { val: 'btech_other', label: 'B.Tech — other branches' },
      { val: 'bba_bcom', label: 'BBA / B.Com' },
      { val: 'design', label: 'Design / Architecture' },
      { val: 'law_liberal', label: 'Law / Liberal Arts' },
      { val: 'not_sure', label: 'Not sure — need guidance' },
    ],
  },
  {
    kicker: 'Your college · 2 of 8', key: 'budget', title: 'Yearly tuition budget?', hint: 'Tuition only — hostel & mess separate',
    opts: [
      { val: 'under2L', label: 'Under ₹2 L' },
      { val: '2_4L', label: '₹2 – 4 L' },
      { val: '4_6L', label: '₹4 – 6 L' },
      { val: '6Lplus', label: '₹6 L +' },
    ],
  },
  {
    kicker: 'Your college · 3 of 8', key: 'location', title: 'Location preference in NCR?',
    opts: [
      { val: 'noida_gnoida', label: 'Noida / Greater Noida' },
      { val: 'gurugram', label: 'Gurugram' },
      { val: 'delhi', label: 'Delhi' },
      { val: 'anywhere_ncr', label: 'Anywhere in NCR' },
    ],
  },
  {
    kicker: 'Your college · 4 of 8', key: 'hostel', title: 'Will you need a hostel?',
    opts: [
      { val: 'hostel_yes', label: 'Yes — hostel needed' },
      { val: 'day_scholar', label: 'No — day scholar' },
      { val: 'pg_flat', label: 'PG / flat nearby' },
      { val: 'hostel_unsure', label: 'Not decided yet' },
    ],
  },
  {
    kicker: 'Your college · 5 of 8', key: 'priorities', title: 'What matters most to you?', hint: 'Pick your top 2 — this shapes your shortlist', multi: true, max: 2,
    opts: [
      { val: 'placements', label: 'Placements & packages' },
      { val: 'fees_roi', label: 'Fees & return on investment' },
      { val: 'campus_hostel', label: 'Campus life & hostel' },
      { val: 'faculty', label: 'Faculty & academics' },
      { val: 'brand', label: 'Brand name & reputation' },
      { val: 'internships', label: 'Internships & exposure' },
    ],
  },
  {
    kicker: 'Your college · 6 of 8', key: 'confusion', title: "What's your biggest confusion right now?",
    opts: [
      { val: 'which_course', label: 'Which course to pick' },
      { val: 'which_college', label: 'Which college to pick' },
      { val: 'budget_vs_quality', label: 'Budget vs quality' },
      { val: 'parents_disagree', label: 'My parents & I disagree' },
      { val: 'all_of_it', label: 'Honestly — all of it' },
    ],
  },
  {
    kicker: 'Your college · 7 of 8', key: 'timeline', title: 'When do you plan to take admission?',
    opts: [
      { val: 'this_month', label: 'This month' },
      { val: '1_3_months', label: 'In 1 – 3 months' },
      { val: 'next_cycle', label: 'Next admission cycle' },
      { val: 'exploring', label: 'Just exploring' },
    ],
  },
  {
    kicker: 'Your college · 8 of 8', key: 'decider', title: 'Who makes the final decision?', hint: 'Honest answer — it helps your counselor help you both',
    opts: [
      { val: 'mostly_me', label: 'Mostly me' },
      { val: 'me_and_parents', label: 'Me + parents together' },
      { val: 'mostly_parents', label: 'Mostly my parents' },
    ],
  },
];

const SUMMARY_KEYS: [string, string][] = [
  ['stage', 'Stage'], ['stream', 'Stream'], ['marks', '12th %'], ['exams', 'Exams'],
  ['courses', 'Courses'], ['budget', 'Budget'], ['location', 'Location'], ['hostel', 'Stay'],
  ['priorities', 'Top priorities'], ['confusion', 'Biggest confusion'], ['timeline', 'Timeline'], ['decider', 'Decision'],
];

const TOTAL = 13;

function optLabel(key: string, val: string) {
  return STEPS.find((s) => s.key === key)?.opts.find((o) => o.val === val)?.label ?? val;
}

export function CollegeQuiz({ open, onClose }: { open: boolean; onClose: () => void }) {
  const submit = useSubmitMentorRequest();
  const [step, setStep] = useState(1); // 1..13 (13 = contact)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [contact, setContact] = useState({ name: '', phone: '', city: '', consent: false });
  const [errs, setErrs] = useState<{ name?: boolean; phone?: boolean; consent?: boolean }>({});
  const [done, setDone] = useState(false);

  if (!open) return null;

  const reset = () => {
    setStep(1);
    setAnswers({});
    setContact({ name: '', phone: '', city: '', consent: false });
    setErrs({});
    setDone(false);
  };
  const close = () => {
    onClose();
    // reset shortly after so the closing view doesn't flash the first step
    setTimeout(reset, 250);
  };

  const cur = STEPS[step - 1];
  const arr = (k: string) => (Array.isArray(answers[k]) ? (answers[k] as string[]) : []);
  const progressPct = done ? 100 : Math.min(((step - 1) / TOTAL) * 100 + 100 / TOTAL, 100);

  const chooseSingle = (key: string, val: string) => {
    setAnswers((a) => ({ ...a, [key]: val }));
    window.setTimeout(() => setStep((s) => Math.min(s + 1, TOTAL)), 200);
  };
  const toggleMulti = (key: string, val: string, max: number) => {
    setAnswers((a) => {
      const c = Array.isArray(a[key]) ? [...(a[key] as string[])] : [];
      const i = c.indexOf(val);
      if (i >= 0) c.splice(i, 1);
      else {
        if (c.length >= max) c.shift();
        c.push(val);
      }
      return { ...a, [key]: c };
    });
  };

  const onSubmit = () => {
    const nameBad = contact.name.trim().length < 2;
    const phoneBad = !/^[6-9]\d{9}$/.test(contact.phone.trim());
    const consentBad = !contact.consent;
    setErrs({ name: nameBad, phone: phoneBad, consent: consentBad });
    if (nameBad || phoneBad || consentBad) return;

    const summary = SUMMARY_KEYS.map(([k, label]) => {
      const v = answers[k];
      if (v == null || (Array.isArray(v) && v.length === 0)) return null;
      const text = Array.isArray(v) ? v.map((x) => optLabel(k, x)).join(', ') : optLabel(k, v);
      return `${label}: ${text}`;
    })
      .filter(Boolean)
      .join('\n');
    const message = `College Fit Quiz${contact.city.trim() ? ` · City: ${contact.city.trim()}` : ''}\n${summary}`;

    submit.mutate(
      {
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        email: '',
        course: arr('courses').map((v) => optLabel('courses', v)).join(', '),
        location: answers.location ? optLabel('location', answers.location as string) : '',
        marks: answers.marks ? optLabel('marks', answers.marks as string) : '',
        budget: answers.budget ? optLabel('budget', answers.budget as string) : '',
        category: '',
        preferredCollege: '',
        contactMethod: 'CALL',
        message,
      },
      {
        onSuccess: () => setDone(true),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-background">
      {/* header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[720px] items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-display text-lg font-extrabold tracking-tight">College Fit Quiz</span>
          </div>
          <button onClick={close} className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground">
            Save &amp; exit <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[720px] px-5 pb-16">
        {!done && (
          <div className="pb-6 pt-8 text-center">
            <h1 className="font-display text-[clamp(24px,4vw,32px)] font-extrabold tracking-[-.02em]">College Fit Quiz</h1>
            <p className="mt-1.5 text-[15px] text-muted-foreground">12 quick taps — we build your profile, your counselor brings your shortlist.</p>
          </div>
        )}

        <div className="mb-14 rounded-[28px] border border-border bg-card p-5 shadow-lg sm:p-7">
          {/* progress */}
          <div className="mb-6 flex items-center gap-3.5">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-to-r from-marigold to-amber-300 transition-[width] duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="whitespace-nowrap font-mono text-xs tracking-[1.4px] text-muted-foreground">
              {done ? 'Done' : step <= 12 ? `${step} / 12` : 'Last step'}
            </span>
          </div>

          {done ? (
            <Success name={contact.name} answers={answers} onClose={close} onRetake={reset} />
          ) : step <= 12 ? (
            <div key={step} className="animate-page">
              <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[2.4px] text-primary">{cur.kicker}</div>
              <h2 className="font-display text-[21px] font-bold tracking-tight">{cur.title}</h2>
              {cur.hint && <p className="mb-4 mt-1 text-[13.5px] font-semibold text-muted-foreground">{cur.hint}</p>}
              <div className={cn('mt-4 grid gap-2.5', cur.hint ? 'mt-0' : '')}>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {cur.opts.map((o) => {
                    const selected = cur.multi ? arr(cur.key).includes(o.val) : answers[cur.key] === o.val;
                    return (
                      <button
                        key={o.val}
                        onClick={() => (cur.multi ? toggleMulti(cur.key, o.val, cur.max ?? 99) : chooseSingle(cur.key, o.val))}
                        className={cn(
                          'flex items-center justify-between gap-2.5 rounded-2xl border-[1.5px] px-4 py-3.5 text-left text-[14.5px] font-bold transition-colors active:scale-[.98]',
                          selected ? 'border-primary bg-accent text-primary' : 'border-border bg-card hover:border-foreground',
                        )}
                      >
                        {o.label}
                        <Check className={cn('h-[17px] w-[17px] flex-none text-primary transition-opacity', selected ? 'opacity-100' : 'opacity-0')} />
                      </button>
                    );
                  })}
                </div>
              </div>
              {/* nav */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  onClick={() => setStep((s) => Math.max(1, s - 1))}
                  className={cn('inline-flex items-center gap-1.5 text-[13.5px] font-bold text-muted-foreground hover:text-foreground', step > 1 ? 'visible' : 'invisible')}
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                {cur.multi && (
                  <Button size="sm" disabled={arr(cur.key).length === 0} onClick={() => setStep((s) => Math.min(s + 1, TOTAL))}>
                    Continue <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* contact step */
            <div key="contact" className="animate-page">
              <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[2.4px] text-primary">Last step</div>
              <h2 className="font-display text-[21px] font-bold tracking-tight">Where should we send your shortlist?</h2>
              <p className="mb-4 mt-1 text-[13.5px] font-semibold text-muted-foreground">Your counselor prepares it before calling — no cold pitches</p>

              <div className="flex flex-col gap-3.5">
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-muted-foreground" htmlFor="qName">Your name</label>
                  <input
                    id="qName"
                    className={cn('w-full rounded-[15px] border-[1.5px] bg-card px-4 py-3 text-[15px] font-semibold outline-none focus:ring-4 focus:ring-accent', errs.name ? 'border-destructive' : 'border-border focus:border-primary')}
                    placeholder="e.g. Aarav Sharma"
                    value={contact.name}
                    onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                  />
                  {errs.name && <span className="mt-1.5 block text-[12.5px] font-bold text-destructive">Please enter your name</span>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-muted-foreground" htmlFor="qPhone">WhatsApp number</label>
                  <input
                    id="qPhone"
                    inputMode="numeric"
                    maxLength={10}
                    className={cn('w-full rounded-[15px] border-[1.5px] bg-card px-4 py-3 text-[15px] font-semibold outline-none focus:ring-4 focus:ring-accent', errs.phone ? 'border-destructive' : 'border-border focus:border-primary')}
                    placeholder="10-digit mobile number"
                    value={contact.phone}
                    onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  />
                  {errs.phone && <span className="mt-1.5 block text-[12.5px] font-bold text-destructive">Enter a valid 10-digit mobile number</span>}
                </div>
                <div>
                  <label className="mb-1.5 block text-[13px] font-bold text-muted-foreground" htmlFor="qCity">Your city <span className="font-semibold text-muted-foreground/70">(optional)</span></label>
                  <input
                    id="qCity"
                    className="w-full rounded-[15px] border-[1.5px] border-border bg-card px-4 py-3 text-[15px] font-semibold outline-none focus:border-primary focus:ring-4 focus:ring-accent"
                    placeholder="e.g. Lucknow"
                    value={contact.city}
                    onChange={(e) => setContact((c) => ({ ...c, city: e.target.value }))}
                  />
                </div>
                <label className="flex items-start gap-2.5 text-[13.5px] font-medium text-muted-foreground">
                  <input type="checkbox" className="mt-1 h-[18px] w-[18px] flex-none accent-primary" checked={contact.consent} onChange={(e) => setContact((c) => ({ ...c, consent: e.target.checked }))} />
                  <span>An EduBridge counselor may contact me on WhatsApp / call about my college shortlist. I can opt out anytime.</span>
                </label>
                {errs.consent && <span className="text-[12.5px] font-bold text-destructive">Please tick the consent box to continue</span>}
              </div>

              <div className="mt-4 flex items-start gap-2 text-[12px] text-muted-foreground">
                <ShieldCheck className="mt-0.5 h-3.5 w-3.5 flex-none text-green" />
                <span>Used only to prepare and share your shortlist. Never sold, never spammed.</span>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <button onClick={() => setStep((s) => Math.max(1, s - 1))} className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <Button onClick={onSubmit} disabled={submit.isPending}>
                  {submit.isPending ? 'Sending…' : 'Get my shortlist'} <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {!done && <p className="pb-4 text-center text-[12.5px] font-semibold text-muted-foreground">Takes about 90 seconds · Free · Human experts only</p>}
      </div>
    </div>
  );
}

function Success({ name, answers, onClose, onRetake }: { name: string; answers: Record<string, string | string[]>; onClose: () => void; onRetake: () => void }) {
  const chips = SUMMARY_KEYS.map(([k, label]) => {
    const v = answers[k];
    if (v == null || (Array.isArray(v) && v.length === 0)) return null;
    const text = Array.isArray(v) ? v.map((x) => optLabel(k, x)).join(' · ') : optLabel(k, v);
    return { label, text };
  }).filter(Boolean) as { label: string; text: string }[];

  return (
    <div className="animate-page text-center">
      <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-green-soft text-green">
        <Check className="h-7 w-7" strokeWidth={2.6} />
      </span>
      <h2 className="font-display text-[25px] font-extrabold tracking-tight">Profile ready{name ? `, ${name.split(' ')[0]}` : ''}!</h2>
      <p className="mx-auto mt-2 max-w-[440px] text-[15px] text-muted-foreground">
        A counselor will WhatsApp you <b className="text-foreground">within 24 hours</b> with a shortlist built on your answers — verified data, honest cons included.
      </p>

      <div className="mt-5 rounded-2xl border border-border bg-background p-5 text-left">
        <h3 className="mb-3 font-mono text-[10.5px] uppercase tracking-[2.2px] text-muted-foreground">Your profile</h3>
        <div className="flex flex-wrap gap-2">
          {chips.map((c) => (
            <span key={c.label} className="rounded-full border border-border bg-card px-3 py-1.5 text-[12.5px] font-bold text-muted-foreground">
              <b className="text-foreground">{c.label}:</b> {c.text}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap justify-center gap-2.5">
        <Button onClick={onClose}>Done</Button>
        <Button variant="outline" onClick={onRetake}>
          <Download className="h-4 w-4 rotate-180" /> Retake quiz
        </Button>
      </div>
    </div>
  );
}

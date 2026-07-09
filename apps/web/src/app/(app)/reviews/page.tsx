'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Columns3, Info, Search, ShieldCheck, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHero } from '@/components/page-hero';
import { cn } from '@/lib/utils';
import { useSubmitMentorRequest } from '@/hooks/use-mentors';

type College = { name: string; loc: string };

const POOL: College[] = [
  { name: 'Shiv Nadar University', loc: 'Greater Noida' },
  { name: 'Bennett University', loc: 'Greater Noida' },
  { name: 'JIIT Noida', loc: 'Noida' },
  { name: 'Galgotias University', loc: 'Greater Noida' },
  { name: 'Amity University Noida', loc: 'Noida' },
  { name: 'Sharda University', loc: 'Greater Noida' },
  { name: 'GL Bajaj Institute', loc: 'Greater Noida' },
  { name: 'NIET Greater Noida', loc: 'Greater Noida' },
  { name: 'IILM University', loc: 'Greater Noida' },
  { name: 'KIET Group Ghaziabad', loc: 'Ghaziabad' },
  { name: 'JSS Academy Noida', loc: 'Noida' },
  { name: 'Galgotias College (GCET)', loc: 'Greater Noida' },
];
const MAX = 10;

const QUIZ: { key: string; q: string; opts: { v: string; label: string }[] }[] = [
  { key: 'course', q: 'Which course are you aiming for?', opts: [
    { v: 'B.Tech CSE / IT', label: 'B.Tech CSE / IT' }, { v: 'B.Tech (other)', label: 'B.Tech (other)' },
    { v: 'BBA / B.Com', label: 'BBA / B.Com' }, { v: 'Other', label: 'Other' } ] },
  { key: 'marks', q: 'Class 12 marks (or expected)?', opts: [
    { v: 'Below 60%', label: 'Below 60%' }, { v: '60–75%', label: '60–75%' },
    { v: '75–90%', label: '75–90%' }, { v: '90%+', label: '90%+' } ] },
  { key: 'budget', q: 'Yearly budget (tuition)?', opts: [
    { v: 'Under ₹2 L', label: 'Under ₹2 L' }, { v: '₹2–4 L', label: '₹2–4 L' },
    { v: '₹4–6 L', label: '₹4–6 L' }, { v: '₹6 L+', label: '₹6 L+' } ] },
  { key: 'hostel', q: 'Hostel needed?', opts: [
    { v: 'Yes — hostel', label: 'Yes — hostel' }, { v: 'Day scholar', label: 'Day scholar' },
    { v: 'Not sure yet', label: 'Not sure yet' } ] },
];

function Steps({ step }: { step: number }) {
  const items = ['Pick colleges', '60-sec quiz', 'Get it on WhatsApp'];
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 pb-6 pt-1">
      {items.map((label, i) => {
        const n = i + 1;
        const state = step === n ? 'on' : step > n ? 'done' : 'idle';
        return (
          <div key={label} className="flex items-center gap-2.5">
            <span className={cn('inline-flex items-center gap-2 text-[12px] font-bold', state === 'idle' ? 'text-muted-foreground' : 'text-foreground')}>
              <span className={cn('grid h-5 w-5 flex-none place-items-center rounded-full border-[1.5px] text-[11px] font-extrabold',
                state === 'on' ? 'border-primary bg-primary text-primary-foreground'
                : state === 'done' ? 'border-green bg-green text-white'
                : 'border-border bg-card text-muted-foreground')}>
                {state === 'done' ? <Check className="h-3 w-3" /> : n}
              </span>
              {label}
            </span>
            {i < items.length - 1 && <span className="w-[18px] border-t-[1.5px] border-dashed border-border" />}
          </div>
        );
      })}
    </div>
  );
}

export default function CompareCollegesPage() {
  const submit = useSubmitMentorRequest();
  const [step, setStep] = useState(1);
  const [added, setAdded] = useState<College[]>([]);
  const [q, setQ] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [consent, setConsent] = useState(false);
  const [sent, setSent] = useState<{ phone: string; count: number } | null>(null);

  const isAdded = (n: string) => added.some((c) => c.name.toLowerCase() === n.toLowerCase());
  const addCollege = (n: string, loc: string) => {
    if (isAdded(n)) return;
    if (added.length >= MAX) {
      toast.error('Maximum 10 colleges — remove one to add another.');
      return;
    }
    setAdded((a) => [...a, { name: n, loc: loc || 'Added by you' }]);
    setQ('');
  };
  const removeCollege = (n: string) => setAdded((a) => a.filter((c) => c.name !== n));

  const suggestions = useMemo(() => {
    const tl = q.trim().toLowerCase();
    return POOL.filter((c) => !isAdded(c.name) && (tl === '' || c.name.toLowerCase().includes(tl) || c.loc.toLowerCase().includes(tl))).slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, added]);
  const showCustom = q.trim().length > 2 && !POOL.some((c) => c.name.toLowerCase() === q.trim().toLowerCase()) && !isAdded(q.trim());

  const onSend = () => {
    if (QUIZ.some((qz) => !answers[qz.key])) {
      toast.error('Please answer all 4 quiz questions.');
      return;
    }
    if (name.trim().length < 2) {
      toast.error('Please add your name.');
      return;
    }
    if (!/^[6-9]\d{9}$/.test(phone.trim())) {
      toast.error('Please enter a valid 10-digit WhatsApp number.');
      return;
    }
    if (!consent) {
      toast.error('Please tick the consent box so we can WhatsApp you.');
      return;
    }
    submit.mutate(
      {
        name: name.trim(),
        phone: phone.trim(),
        course: answers.course,
        marks: answers.marks,
        budget: answers.budget,
        preferredCollege: added.map((c) => c.name).join(', '),
        contactMethod: 'CHAT',
        message: `College Comparison request — comparing: ${added.map((c) => c.name).join(', ')}. Hostel: ${answers.hostel}.`,
      },
      {
        onSuccess: () => {
          setSent({ phone: phone.trim(), count: added.length });
          setStep(3);
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  const field = 'w-full rounded-2xl border-[1.5px] border-border bg-background px-4 py-3 text-[15px] font-semibold outline-none focus:border-primary focus:bg-card focus:ring-4 focus:ring-accent';

  return (
    <div className="mx-auto max-w-[760px] space-y-2">
      <PageHero
        eyebrow="Compare Colleges"
        title="College comparison,"
        accent="verified."
        sub="Pick up to 10 colleges. A verified counselor checks the real numbers — fees, median package, placements, hostel & food — and sends your comparison on WhatsApp."
      />

      <Steps step={step} />

      {/* STEP 1 — pick colleges */}
      {step === 1 && (
        <section className="rounded-3xl border border-border bg-card p-6 shadow-sm">
          <div className="relative mb-4">
            <div className="flex items-center gap-2.5 rounded-full border-[1.5px] border-border bg-background px-4 py-3 focus-within:border-primary focus-within:bg-card focus-within:ring-4 focus-within:ring-accent">
              <Search className="h-[18px] w-[18px] flex-none text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onFocus={() => setDropOpen(true)}
                onBlur={() => setTimeout(() => setDropOpen(false), 120)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const hit = suggestions[0];
                    if (hit) addCollege(hit.name, hit.loc);
                    else if (showCustom) addCollege(q.trim(), '');
                  }
                }}
                placeholder="Search a college — e.g. Bennett"
                aria-label="Search a college to add"
                className="min-w-0 flex-1 bg-transparent text-[15px] font-semibold outline-none placeholder:font-medium placeholder:text-muted-foreground"
              />
              <span className={cn('whitespace-nowrap font-mono text-xs font-bold', added.length >= MAX ? 'text-amber-600' : 'text-muted-foreground')}>{added.length} / {MAX}</span>
            </div>
            {dropOpen && (suggestions.length > 0 || showCustom) && (
              <div className="absolute inset-x-0 top-[calc(100%+6px)] z-40 max-h-[250px] overflow-y-auto rounded-2xl border border-border bg-card shadow-lg">
                {suggestions.map((c) => (
                  <button
                    key={c.name}
                    onMouseDown={(e) => { e.preventDefault(); addCollege(c.name, c.loc); }}
                    className="flex w-full items-center justify-between gap-2.5 px-4 py-3 text-left text-[14px] font-bold hover:bg-accent"
                  >
                    {c.name} <small className="text-[11.5px] font-semibold text-muted-foreground">{c.loc}</small>
                  </button>
                ))}
                {showCustom && (
                  <button
                    onMouseDown={(e) => { e.preventDefault(); addCollege(q.trim(), ''); }}
                    className="flex w-full items-center justify-between gap-2.5 px-4 py-3 text-left text-[14px] font-bold text-primary hover:bg-accent"
                  >
                    + Add &ldquo;{q.trim()}&rdquo; <small className="text-[11.5px] font-semibold text-muted-foreground">not in list</small>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex min-h-[44px] flex-wrap gap-2.5">
            {added.length === 0 ? (
              <span className="px-0.5 py-2 text-[13.5px] font-semibold text-muted-foreground">No colleges yet — add the ones you&apos;re confused between.</span>
            ) : (
              added.map((c) => (
                <span key={c.name} className="inline-flex items-center gap-2.5 rounded-full border-[1.5px] border-foreground bg-card py-2 pl-4 pr-2 text-[13.5px] font-bold">
                  {c.name}
                  <button onClick={() => removeCollege(c.name)} aria-label={`Remove ${c.name}`} className="grid h-5 w-5 place-items-center rounded-full bg-secondary text-muted-foreground hover:bg-[#F3D9CE] hover:text-amber-700">
                    <X className="h-2.5 w-2.5" strokeWidth={3} />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="mt-3.5 flex items-center gap-2 text-[12.5px] font-semibold text-muted-foreground">
            <Info className="h-3.5 w-3.5 flex-none text-marigold" />
            Add at least 2 colleges to compare. College not in the list? Type it and add anyway.
          </div>

          {added.length >= 2 && (
            <button onClick={() => setStep(2)} className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-extrabold text-primary-foreground transition-colors hover:bg-primary/90">
              Continue — 60-second quiz <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </section>
      )}

      {/* STEP 2 — quiz + whatsapp */}
      {step === 2 && (
        <section>
          <button onClick={() => setStep(1)} className="mb-3.5 inline-flex items-center gap-1.5 text-[13px] font-bold text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Edit colleges
          </button>
          <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2 rounded-2xl bg-accent px-4 py-3 text-[13px] font-bold text-primary">
              <Columns3 className="h-[15px] w-[15px] flex-none" />
              Comparing {added.length} colleges: {added.map((c) => c.name).join(', ')}
            </div>

            {QUIZ.map((qz) => (
              <div key={qz.key} className="mb-[18px]">
                <label className="mb-2.5 block font-display text-[15.5px] font-bold tracking-tight">{qz.q}</label>
                <div className="flex flex-wrap gap-2">
                  {qz.opts.map((o) => (
                    <button
                      key={o.v}
                      onClick={() => setAnswers((a) => ({ ...a, [qz.key]: o.v }))}
                      className={cn('rounded-full border-[1.5px] px-4 py-2.5 text-[13.5px] font-bold transition-colors',
                        answers[qz.key] === o.v ? 'border-primary bg-primary text-primary-foreground' : 'border-border bg-card hover:border-foreground')}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            <div className="mb-3.5">
              <label className="mb-1.5 block text-[13px] font-bold text-muted-foreground" htmlFor="cc-name">Your name</label>
              <input id="cc-name" className={field} placeholder="e.g. Priya Sharma" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="mb-3.5">
              <label className="mb-1.5 block text-[13px] font-bold text-muted-foreground" htmlFor="cc-phone">WhatsApp number</label>
              <input id="cc-phone" inputMode="numeric" maxLength={10} className={field} placeholder="10-digit number" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
            </div>
            <label className="mb-4 mt-1 flex items-start gap-2.5 text-[12.5px] font-semibold text-muted-foreground">
              <input type="checkbox" className="mt-0.5 h-4 w-4 flex-none accent-primary" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
              <span>Send my verified comparison on WhatsApp. One counselor follow-up if numbers need context — no spam, opt out anytime.</span>
            </label>

            <button onClick={onSend} disabled={submit.isPending} className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-extrabold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
              {submit.isPending ? 'Sending…' : 'Send my comparison request'} <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 3 — sent */}
      {step === 3 && sent && (
        <section className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
          <span className="mx-auto mb-4 grid h-[60px] w-[60px] place-items-center rounded-full bg-green-soft text-green">
            <Check className="h-7 w-7" strokeWidth={2.8} />
          </span>
          <h2 className="font-display text-[23px] font-extrabold tracking-tight">Request received!</h2>
          <p className="mx-auto mt-2 max-w-[440px] text-[14.5px] text-muted-foreground">
            A verified counselor will check the real numbers for your {sent.count} colleges and WhatsApp your comparison to {sent.phone.replace(/(\d{2})\d{6}(\d{2})/, '$1******$2')} within 24 hours.
          </p>
          <p className="mx-auto mt-2 max-w-[440px] text-[14.5px] text-muted-foreground">
            You&apos;ll get fees, median package, placement rate, hostel &amp; food ratings — <b className="text-foreground">verified, cons included.</b>
          </p>
          <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-green-soft px-4 py-2 text-[12.5px] font-extrabold text-green">
            <ShieldCheck className="h-3.5 w-3.5" /> Checked by a verified counselor — no AI guesses
          </span>
        </section>
      )}

      <p className="px-1 pb-4 pt-4 text-[11.5px] font-semibold text-muted-foreground">
        We only use your number to send this comparison and follow up once. Delete anytime — one message does it.
      </p>
    </div>
  );
}

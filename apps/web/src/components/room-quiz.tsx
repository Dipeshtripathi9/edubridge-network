'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Home, X } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useSubmitRentalLead } from '@/hooks/use-rentals';

type Opt = { val: string; label: string; reveal?: 'college' | 'budget' | 'other' };
type QStep = { kicker: string; title: string; hint?: string; key: string; multi?: boolean; opts: Opt[] };

const STEPS: QStep[] = [
  {
    kicker: 'Question 1', key: 'college', title: 'Which college are you joining?',
    opts: [
      { val: 'Bennett University', label: 'Bennett University' },
      { val: 'Shiv Nadar University', label: 'Shiv Nadar University' },
      { val: 'Galgotias University', label: 'Galgotias University' },
      { val: 'other', label: "Another NCR college — I'll type it", reveal: 'college' },
    ],
  },
  {
    kicker: 'Question 2', key: 'genderPref', title: 'What kind of place suits you?',
    opts: [
      { val: 'Boys accommodation', label: 'Boys accommodation' },
      { val: 'Girls accommodation', label: 'Girls accommodation' },
      { val: 'Co-ed is fine', label: 'Co-ed co-living is fine' },
    ],
  },
  {
    kicker: 'Question 3', key: 'budget', title: 'Monthly budget — rent + food?',
    opts: [
      { val: 'Under ₹7,000', label: 'Under ₹7,000' },
      { val: '₹7,000 – 10,000', label: '₹7,000 – 10,000' },
      { val: '₹10,000 – 13,000', label: '₹10,000 – 13,000' },
      { val: '₹13,000 +', label: '₹13,000 +' },
      { val: 'exact', label: "I'll type my exact budget", reveal: 'budget' },
    ],
  },
  {
    kicker: 'Question 4', key: 'mustHaves', title: 'Your non-negotiables?', hint: 'Tick in order of priority — your first tick = priority #1. Untick to reorder.', multi: true,
    opts: [
      { val: 'Walking distance to campus', label: 'Walking distance to campus' },
      { val: 'AC room', label: 'AC room' },
      { val: 'Good food included', label: 'Good food included' },
      { val: 'Furnished room', label: 'Furnished room' },
      { val: 'Gym & amenities', label: 'Gym & amenities' },
      { val: 'Security / CCTV', label: 'Security / CCTV' },
      { val: 'Lowest possible rent', label: 'Lowest possible rent' },
      { val: 'other', label: "Something else — I'll type it", reveal: 'other' },
    ],
  },
  {
    kicker: 'Question 5', key: 'movein', title: 'When do you move in?',
    opts: [
      { val: 'This week', label: 'This week' },
      { val: 'This month', label: 'This month' },
      { val: 'Next semester', label: 'Next semester' },
      { val: 'Just exploring', label: 'Just exploring' },
    ],
  },
];

const TOTAL = 6; // 5 questions + contact

export function RoomQuiz({ open, onClose }: { open: boolean; onClose: () => void }) {
  const submit = useSubmitRentalLead();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [reveals, setReveals] = useState({ college: '', budget: '', other: '' });
  const [contact, setContact] = useState({ name: '', phone: '', area: '', consent: true });
  const [errs, setErrs] = useState<{ name?: boolean; phone?: boolean; reveal?: boolean }>({});
  const [done, setDone] = useState(false);

  if (!open) return null;

  const reset = () => {
    setStep(1);
    setAnswers({});
    setReveals({ college: '', budget: '', other: '' });
    setContact({ name: '', phone: '', area: '', consent: true });
    setErrs({});
    setDone(false);
  };
  const close = () => {
    onClose();
    setTimeout(reset, 250);
  };

  const cur = STEPS[step - 1];
  const arr = (k: string) => (Array.isArray(answers[k]) ? (answers[k] as string[]) : []);
  const progressPct = done ? 100 : Math.min((step / TOTAL) * 100, 100);

  const activeReveal = (): 'college' | 'budget' | 'other' | null => {
    if (!cur) return null;
    if (cur.multi) return arr(cur.key).includes('other') ? 'other' : null;
    const sel = cur.opts.find((o) => o.val === answers[cur.key]);
    return sel?.reveal ?? null;
  };

  const goNext = () => {
    const rv = activeReveal();
    if (rv && reveals[rv].trim().length < (rv === 'budget' ? 3 : 2)) {
      setErrs((e) => ({ ...e, reveal: true }));
      return;
    }
    setErrs((e) => ({ ...e, reveal: false }));
    setStep((s) => Math.min(s + 1, TOTAL));
  };

  const chooseSingle = (o: Opt) => {
    setAnswers((a) => ({ ...a, [cur.key]: o.val }));
    setErrs((e) => ({ ...e, reveal: false }));
    if (!o.reveal) window.setTimeout(() => setStep((s) => Math.min(s + 1, TOTAL)), 200);
  };
  const toggleMulti = (o: Opt) => {
    setAnswers((a) => {
      const c = Array.isArray(a[cur.key]) ? [...(a[cur.key] as string[])] : [];
      const i = c.indexOf(o.val);
      if (i >= 0) c.splice(i, 1);
      else c.push(o.val);
      return { ...a, [cur.key]: c };
    });
  };

  const onSubmit = () => {
    const nameBad = contact.name.trim().length < 2;
    const phoneBad = !/^[6-9]\d{9}$/.test(contact.phone.trim());
    setErrs({ name: nameBad, phone: phoneBad });
    if (nameBad || phoneBad || !contact.consent) {
      if (!contact.consent) toast.error('Please tick the consent box to continue');
      return;
    }

    const college = answers.college === 'other' ? reveals.college.trim() : (answers.college as string) ?? '';
    const budget = answers.budget === 'exact' ? `₹${reveals.budget.trim()}` : (answers.budget as string) ?? '';
    const musts = arr('mustHaves')
      .map((m, i) => (m === 'other' ? `#${i + 1} ${reveals.other.trim()}` : `#${i + 1} ${m}`))
      .join(', ');
    const requirements = [
      musts && `Non-negotiables: ${musts}`,
      answers.movein && `Move-in: ${answers.movein}`,
    ]
      .filter(Boolean)
      .join(' · ');

    submit.mutate(
      {
        kind: 'SEEKER',
        name: contact.name.trim(),
        phone: contact.phone.trim(),
        college,
        location: contact.area.trim() || undefined,
        budget: budget || undefined,
        gender: (answers.genderPref as string) || undefined,
        moveInDate: (answers.movein as string) || undefined,
        requirements: requirements || undefined,
      },
      {
        onSuccess: () => setDone(true),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  const rv = activeReveal();

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-background">
      <header className="sticky top-0 z-10 border-b border-border bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[720px] items-center justify-between px-5">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-[10px] bg-[#F4502C] text-white"><Home className="h-4 w-4" /></span>
            <span className="font-display text-lg font-extrabold tracking-tight">ez-<span className="text-[#F4502C]">rentbuddy</span></span>
          </div>
          <button onClick={close} className="flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground">
            Save &amp; exit <X className="h-4 w-4" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[720px] px-5 pb-16">
        {!done && (
          <div className="pb-6 pt-8 text-center">
            <h1 className="font-display text-[clamp(24px,4vw,32px)] font-extrabold tracking-[-.02em]">Find your room in 7 taps.</h1>
            <p className="mt-1.5 text-[15px] text-muted-foreground">Answer a few quick questions — a room buddy sends your top matches on WhatsApp.</p>
          </div>
        )}

        <div className="mb-14 rounded-[28px] border border-border bg-card p-5 shadow-lg sm:p-7">
          <div className="mb-6 flex items-center gap-3.5">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-gradient-to-r from-[#FFC24B] to-[#FFD98A] transition-[width] duration-500" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="whitespace-nowrap font-mono text-xs tracking-[1.4px] text-muted-foreground">{done ? 'Done' : `${step} / ${TOTAL - 1}`}</span>
          </div>

          {done ? (
            <div className="animate-page text-center">
              <span className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-green-soft text-green"><Check className="h-7 w-7" strokeWidth={2.6} /></span>
              <h2 className="font-display text-[25px] font-extrabold tracking-tight">Sorted{contact.name ? `, ${contact.name.split(' ')[0]}` : ''}!</h2>
              <p className="mx-auto mt-2 max-w-[440px] text-[15px] text-muted-foreground">
                A room buddy will WhatsApp your top matches near <b className="text-foreground">{answers.college === 'other' ? reveals.college || 'your campus' : (answers.college as string) || 'your campus'}</b> — with a current resident’s honest take on each.
              </p>
              <button onClick={close} className="mt-6 inline-flex items-center justify-center rounded-full bg-[#F4502C] px-7 py-3.5 text-[15px] font-bold text-white transition-colors hover:bg-[#D93E1D]">Done</button>
            </div>
          ) : step <= 5 ? (
            <div key={step} className="animate-page">
              <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[2.4px] text-[#F4502C]">{cur.kicker}</div>
              <h2 className="font-display text-[21px] font-bold tracking-tight">{cur.title}</h2>
              {cur.hint && <p className="mb-4 mt-1 text-[13.5px] font-semibold text-muted-foreground">{cur.hint}</p>}
              <div className={cn('grid grid-cols-1 gap-2.5 sm:grid-cols-2', cur.hint ? '' : 'mt-4')}>
                {cur.opts.map((o) => {
                  const selected = cur.multi ? arr(cur.key).includes(o.val) : answers[cur.key] === o.val;
                  const rank = cur.multi && selected ? arr(cur.key).indexOf(o.val) + 1 : 0;
                  const full = o.reveal === 'other' || o.reveal === 'budget';
                  return (
                    <button
                      key={o.val}
                      onClick={() => (cur.multi ? toggleMulti(o) : chooseSingle(o))}
                      className={cn(
                        'flex items-center gap-2.5 rounded-2xl border-[1.5px] px-4 py-3.5 text-left text-[14.5px] font-bold transition-colors active:scale-[.98]',
                        full && 'sm:col-span-2',
                        selected ? 'border-[#F4502C] bg-[#FFE9E1] text-[#7A2410]' : 'border-border bg-card hover:border-foreground',
                      )}
                    >
                      {cur.multi && (
                        <span className={cn('grid h-[22px] w-[22px] flex-none place-items-center rounded-full font-display text-[11.5px] font-extrabold', selected ? 'bg-[#F4502C] text-white' : 'hidden')}>{rank}</span>
                      )}
                      <span className="flex-1">{o.label}</span>
                      {!cur.multi && <Check className={cn('h-[17px] w-[17px] flex-none text-[#F4502C] transition-opacity', selected ? 'opacity-100' : 'opacity-0')} />}
                    </button>
                  );
                })}
              </div>

              {rv && (
                <div className="mt-3.5 flex flex-wrap items-center gap-2">
                  {rv === 'budget' && <span className="font-display text-[15px] font-extrabold text-muted-foreground">₹</span>}
                  <input
                    autoFocus
                    inputMode={rv === 'budget' ? 'numeric' : 'text'}
                    className={cn('min-w-0 flex-1 rounded-full border-[1.5px] bg-card px-4 py-3 text-[14.5px] font-semibold outline-none focus:ring-4 focus:ring-[#FFE9E1]', errs.reveal ? 'border-destructive' : 'border-border focus:border-[#F4502C]')}
                    placeholder={rv === 'college' ? 'Type your college — e.g. Amity Noida' : rv === 'budget' ? 'e.g. 8500 per month' : 'e.g. attached washroom, parking'}
                    value={reveals[rv]}
                    onChange={(e) => setReveals((r) => ({ ...r, [rv]: rv === 'budget' ? e.target.value.replace(/\D/g, '') : e.target.value }))}
                  />
                  {errs.reveal && <span className="w-full text-[12.5px] font-bold text-destructive">Please fill this in to continue</span>}
                </div>
              )}

              <div className="mt-6 flex items-center justify-between gap-3">
                <button onClick={() => setStep((s) => Math.max(1, s - 1))} className={cn('inline-flex items-center gap-1.5 text-[13.5px] font-bold text-muted-foreground hover:text-foreground', step > 1 ? 'visible' : 'invisible')}>
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                {(cur.multi ? arr(cur.key).length > 0 : !!rv) && (
                  <button onClick={goNext} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#F4502C] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#D93E1D]">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div key="contact" className="animate-page">
              <div className="mb-2 font-mono text-[10.5px] uppercase tracking-[2.4px] text-[#F4502C]">Last step</div>
              <h2 className="font-display text-[21px] font-bold tracking-tight">Where should we send your matches?</h2>
              <p className="mb-4 mt-1 text-[13.5px] font-semibold text-muted-foreground">A room buddy sends your top matches on WhatsApp and books your visits — free.</p>
              <div className="flex flex-col gap-3.5">
                <div>
                  <input
                    className={cn('w-full rounded-full border-[1.5px] bg-card px-4 py-3 text-[15px] font-semibold outline-none focus:ring-4 focus:ring-[#FFE9E1]', errs.name ? 'border-destructive' : 'border-border focus:border-[#F4502C]')}
                    placeholder="Your name *"
                    value={contact.name}
                    onChange={(e) => setContact((c) => ({ ...c, name: e.target.value }))}
                  />
                  {errs.name && <span className="mt-1.5 block text-[12.5px] font-bold text-destructive">Please enter your name</span>}
                </div>
                <div>
                  <input
                    inputMode="numeric"
                    maxLength={10}
                    className={cn('w-full rounded-full border-[1.5px] bg-card px-4 py-3 text-[15px] font-semibold outline-none focus:ring-4 focus:ring-[#FFE9E1]', errs.phone ? 'border-destructive' : 'border-border focus:border-[#F4502C]')}
                    placeholder="WhatsApp number *"
                    value={contact.phone}
                    onChange={(e) => setContact((c) => ({ ...c, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  />
                  {errs.phone && <span className="mt-1.5 block text-[12.5px] font-bold text-destructive">Enter a valid 10-digit mobile number</span>}
                </div>
                <input
                  className="w-full rounded-full border-[1.5px] border-border bg-card px-4 py-3 text-[15px] font-semibold outline-none focus:border-[#F4502C] focus:ring-4 focus:ring-[#FFE9E1]"
                  placeholder="Preferred area (optional) — e.g. Knowledge Park 3"
                  value={contact.area}
                  onChange={(e) => setContact((c) => ({ ...c, area: e.target.value }))}
                />
                <label className="flex items-start gap-2.5 text-[13px] font-medium text-muted-foreground">
                  <input type="checkbox" className="mt-1 h-[18px] w-[18px] flex-none accent-[#F4502C]" checked={contact.consent} onChange={(e) => setContact((c) => ({ ...c, consent: e.target.checked }))} />
                  <span>EZ-Rentbuddy may message me on WhatsApp about these matches. Opt out anytime.</span>
                </label>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <button onClick={() => setStep((s) => Math.max(1, s - 1))} className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-muted-foreground hover:text-foreground">
                  <ArrowLeft className="h-4 w-4" /> Back
                </button>
                <button onClick={onSubmit} disabled={submit.isPending} className="inline-flex items-center justify-center gap-1.5 rounded-full bg-[#F4502C] px-6 py-3 text-[15px] font-bold text-white transition-colors hover:bg-[#D93E1D] disabled:opacity-60">
                  {submit.isPending ? 'Sending…' : 'Send my top matches'} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {!done && <p className="pb-4 text-center text-[12.5px] font-semibold text-muted-foreground">60 seconds · An EduBridge Network company</p>}
      </div>
    </div>
  );
}

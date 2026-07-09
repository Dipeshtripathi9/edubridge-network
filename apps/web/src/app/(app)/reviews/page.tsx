'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Check, Info, Plus, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { PageHero } from '@/components/page-hero';
import { CollegeQuiz } from '@/components/college-quiz';
import { cn } from '@/lib/utils';

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
  const [added, setAdded] = useState<College[]>([]);
  const [q, setQ] = useState('');
  const [dropOpen, setDropOpen] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);

  const isAdded = (n: string) => added.some((c) => c.name.toLowerCase() === n.toLowerCase());
  const addCollege = (n: string, loc: string) => {
    const name = n.trim();
    if (name.length < 2 || isAdded(name)) return;
    if (added.length >= MAX) {
      toast.error('Maximum 10 colleges — remove one to add another.');
      return;
    }
    setAdded((a) => [...a, { name, loc: loc || 'Added by you' }]);
    setQ('');
  };
  const removeCollege = (n: string) => setAdded((a) => a.filter((c) => c.name !== n));

  const suggestions = useMemo(() => {
    const tl = q.trim().toLowerCase();
    return POOL.filter((c) => !isAdded(c.name) && (tl === '' || c.name.toLowerCase().includes(tl) || c.loc.toLowerCase().includes(tl))).slice(0, 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, added]);
  const showCustom = q.trim().length >= 2 && !POOL.some((c) => c.name.toLowerCase() === q.trim().toLowerCase()) && !isAdded(q.trim());

  return (
    <div className="mx-auto max-w-[760px] space-y-2">
      <CollegeQuiz open={quizOpen} onClose={() => setQuizOpen(false)} colleges={added.map((c) => c.name)} />

      <PageHero
        eyebrow="Compare Colleges"
        title="College comparison,"
        accent="verified."
        sub="Pick up to 10 colleges — a verified counselor checks the real numbers (fees, median package, placements, hostel & food) and sends your comparison on WhatsApp."
      />

      <Steps step={quizOpen ? 2 : 1} />

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
              placeholder="Search or type any college — e.g. Bennett, Amity…"
              aria-label="Search or type a college to add"
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
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-[14px] font-bold text-primary hover:bg-accent"
                >
                  <Plus className="h-4 w-4 flex-none" /> Add &ldquo;{q.trim()}&rdquo; <small className="ml-auto text-[11.5px] font-semibold text-muted-foreground">type it yourself</small>
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
          Add at least 2 colleges. College not in the list? Type its name and tap &ldquo;Add&rdquo; (or press Enter).
        </div>

        {added.length >= 2 && (
          <button onClick={() => setQuizOpen(true)} className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3.5 text-[15px] font-extrabold text-primary-foreground transition-colors hover:bg-primary/90">
            Continue — take the quiz <ArrowRight className="h-4 w-4" />
          </button>
        )}
      </section>

      <p className="px-1 pb-4 pt-4 text-[11.5px] font-semibold text-muted-foreground">
        We only use your number to send this comparison and follow up once. Delete anytime — one message does it.
      </p>
    </div>
  );
}

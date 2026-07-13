'use client';

import { useRef, useState } from 'react';
import { Mail, Phone, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  type ProfileLead,
  type StepData,
  useDeleteProfileLead,
  useSetProfileLeadNote,
} from '@/hooks/use-profile-leads';

const STEP_TITLES = ['Welcome', 'Contact', 'Personalize', 'Academics', 'Next steps'];
const LABELS: Record<string, string> = {
  firstName: 'First name', lastName: 'Last name', dob: 'Birthdate', purpose: 'Purpose', studying: 'Studying',
  email: 'Email', city: 'City', state: 'State', pin: 'PIN', phone: 'Phone',
  courses: 'Courses', cities: 'Cities', mode: 'Mode', degree: 'Degree', hostel: 'Hostel', budget: 'Budget',
  board: 'Board', stream: 'Stream', passYear: 'Passing year', p12: 'Class 12 %', p10: 'Class 10 %',
  marksheet: 'Marksheet', exams: 'Entrance exams',
  quiz: 'College quiz — priority', comparePriorities: 'Compare priorities', directApply: 'Wants direct apply',
};
const QUIZ_ANSWERS: Record<string, string> = {
  placements: 'Placements & career outcomes', fees: 'Fees & scholarships',
  location: 'Location & campus life', faculty: 'Faculty & curriculum',
};

function renderValue(v: unknown, key?: string): string {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (key === 'quiz' && typeof v === 'string') return QUIZ_ANSWERS[v] ?? v;
  if (Array.isArray(v)) {
    if (v.length === 0) return '—';
    if (typeof v[0] === 'object' && v[0] !== null) {
      return (v as Record<string, unknown>[])
        .map((e) => [e.name, e.score, e.file].filter(Boolean).join(' · '))
        .join('  |  ');
    }
    return v.join(', ');
  }
  return String(v);
}

function StepPanel({ data }: { data?: StepData | null }) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Not filled yet.</p>;
  }
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
      {Object.entries(data).map(([k, v]) => (
        <div key={k} className="min-w-0">
          <dt className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{LABELS[k] ?? k}</dt>
          <dd className="break-words text-sm font-medium">{renderValue(v, k)}</dd>
        </div>
      ))}
    </dl>
  );
}

export function ProfileLeadCard({ lead }: { lead: ProfileLead }) {
  const scroller = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [note, setNote] = useState(lead.adminNote ?? '');
  const [confirming, setConfirming] = useState(false);
  const [reason, setReason] = useState('');
  const setNoteM = useSetProfileLeadNote();
  const del = useDeleteProfileLead();

  const steps = [lead.step1, lead.step2, lead.step3, lead.step4, lead.step5];
  const words = note.trim() ? note.trim().split(/\s+/).length : 0;
  const overLimit = words > 300;

  const goto = (i: number) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollTo({ left: i * el.clientWidth, behavior: 'smooth' });
    setActive(i);
  };
  const onScroll = () => {
    const el = scroller.current;
    if (!el) return;
    setActive(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 border-b border-border p-4">
        <div className="min-w-0">
          <p className="truncate font-bold">{lead.name || 'Unnamed student'}</p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                <Phone className="h-3 w-3" /> {lead.phone}
              </a>
            )}
            {lead.email && (
              <a href={`mailto:${lead.email}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                <Mail className="h-3 w-3" /> {lead.email}
              </a>
            )}
            <span className="text-muted-foreground">{new Date(lead.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <button
          aria-label="Delete profile"
          onClick={() => setConfirming((v) => !v)}
          className="grid h-9 w-9 flex-none place-items-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Completion */}
      <div className="px-4 pt-3">
        <div className="mb-1 flex items-center justify-between text-xs font-semibold">
          <span className="text-muted-foreground">Profile completion</span>
          <span className="tabular-nums text-primary">{lead.completionPct}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-accent">
          <div className="h-full rounded-full bg-gradient-to-r from-primary to-marigold transition-[width] duration-500" style={{ width: `${lead.completionPct}%` }} />
        </div>
      </div>

      {/* Delete-with-reason */}
      {confirming && (
        <div className="mx-4 mt-3 rounded-xl border border-destructive/40 bg-destructive/5 p-3">
          <p className="mb-2 text-sm font-semibold text-destructive">Delete this profile — permanent for admin & student.</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for deletion (required)…"
            rows={2}
            className="w-full resize-none rounded-lg border border-border bg-background p-2 text-sm outline-none focus:border-destructive"
          />
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => { setConfirming(false); setReason(''); }}>Cancel</Button>
            <Button
              size="sm"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={!reason.trim() || del.isPending}
              onClick={() => del.mutate({ id: lead.id, reason: reason.trim() })}
            >
              {del.isPending ? 'Deleting…' : 'Delete profile'}
            </Button>
          </div>
        </div>
      )}

      {/* Swipeable steps */}
      <div className="p-4">
        <div ref={scroller} onScroll={onScroll} className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {steps.map((s, i) => (
            <div key={i} className="w-full flex-none snap-start pr-1">
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[2px] text-primary">Step {i + 1} · {STEP_TITLES[i]}</p>
              <StepPanel data={s} />
            </div>
          ))}
        </div>
        {/* Dots */}
        <div className="mt-4 flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <button
              key={i}
              aria-label={`Step ${i + 1}`}
              onClick={() => goto(i)}
              className={cn('h-2 rounded-full transition-all', active === i ? 'w-5 bg-primary' : 'w-2 bg-border')}
            />
          ))}
        </div>
      </div>

      {/* Counselor note */}
      <div className="border-t border-border p-4">
        <div className="mb-1.5 flex items-center justify-between">
          <p className="text-sm font-semibold">Counselor note</p>
          <span className={cn('text-xs tabular-nums', overLimit ? 'text-destructive' : 'text-muted-foreground')}>{words}/300 words</span>
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Private note about this student (max 300 words)…"
          rows={3}
          className="w-full resize-y rounded-lg border border-border bg-background p-2.5 text-sm outline-none focus:border-primary"
        />
        <div className="mt-2 flex justify-end">
          <Button
            size="sm"
            variant="outline"
            disabled={overLimit || setNoteM.isPending || note === (lead.adminNote ?? '')}
            onClick={() => setNoteM.mutate({ id: lead.id, note })}
          >
            {setNoteM.isPending ? 'Saving…' : 'Save note'}
          </Button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import styles from './college-match-quiz.module.css';

type QuestionType = 'single' | 'multi3' | 'search';

interface Question {
  type: QuestionType;
  title: string;
  sub?: string;
  options?: string[];
}

const TOTAL = 10;

const QUESTIONS: Record<number, Question> = {
  1: {
    type: 'multi3',
    title: 'What matters most to you?',
    sub: "Pick up to 3 — we'll weigh these the heaviest in your matches.",
    options: ['Placements', 'Low Fees', 'Campus Life', 'Academics', 'College Reputation', 'Startup Culture', 'Coding Culture', 'Internships', 'Hostel', 'Safety'],
  },
  2: {
    type: 'single',
    title: "What's your yearly budget?",
    sub: "Total fees you're comfortable with, per year.",
    options: ['₹1–2 Lakh', '₹2–3 Lakh', '₹3–4 Lakh', '₹4–5 Lakh'],
  },
  3: {
    type: 'single',
    title: 'Government or private college?',
    sub: 'Pick one — or leave it open.',
    options: ['Government', 'Private', 'Either'],
  },
  4: {
    type: 'single',
    title: 'Where do you want to study?',
    sub: 'This helps narrow down location.',
    options: ['Near Home', 'Same State', 'Anywhere in India'],
  },
  5: {
    type: 'single',
    title: 'Do you need hostel accommodation?',
    options: ['Yes', 'No', "Doesn't Matter"],
  },
  6: {
    type: 'multi3',
    title: 'What kind of campus do you want?',
    sub: 'Pick up to 3.',
    options: ['Coding Culture', 'Startup Ecosystem', 'Research', 'Sports', 'Cultural Events', 'International Exposure', 'Clubs & Societies', 'Peaceful Campus'],
  },
  7: {
    type: 'single',
    title: "What's your career goal?",
    sub: 'Pick the one closest to your plan right now.',
    options: ['Get a High-Paying Job', 'Crack GATE', 'Prepare for UPSC', 'MBA', 'MS Abroad', 'Become a Researcher', 'Start a Company', 'Still Exploring'],
  },
  8: {
    type: 'multi3',
    title: 'Any deal-breakers?',
    sub: 'Pick up to 3 — colleges with these issues get filtered out entirely.',
    options: ['Poor Placements', 'High Fees', 'Bad Hostel', 'Strict Attendance', 'Poor Faculty', 'Unsafe Campus', 'Weak Coding Culture', 'Bad Reviews'],
  },
  9: {
    type: 'single',
    title: 'How much do verified student reviews matter to you?',
    options: ['Extremely Important', 'Important', 'Neutral', 'Not Important'],
  },
  10: {
    type: 'search',
    title: 'Have you already considered any colleges?',
    sub: "Search and add any you've looked at — we won't recommend these again, but we'll use them to suggest similar ones.",
  },
};

const SUMMARY_LABELS: Record<number, string> = {
  1: 'Top priorities',
  2: 'Budget',
  3: 'College type',
  4: 'Location preference',
  5: 'Hostel needed',
  6: 'Campus vibe',
  7: 'Career goal',
  8: 'Deal-breakers',
  9: 'Importance of reviews',
  10: 'Already considered',
};

export function CollegeMatchQuiz({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [current, setCurrent] = useState(1);
  const [onSummary, setOnSummary] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [stateInput, setStateInput] = useState('');
  const [collegeList, setCollegeList] = useState<string[]>([]);
  const [collegeInput, setCollegeInput] = useState('');

  if (!open) return null;

  const reset = () => {
    setCurrent(1);
    setOnSummary(false);
    setAnswers({});
    setStateInput('');
    setCollegeList([]);
    setCollegeInput('');
  };
  const close = () => {
    onClose();
    setTimeout(reset, 250);
  };

  const selectSingle = (q: number, opt: string) => {
    setAnswers((a) => ({ ...a, [q]: opt }));
  };

  const toggleMulti = (q: number, opt: string) => {
    setAnswers((a) => {
      const cur = Array.isArray(a[q]) ? [...(a[q] as string[])] : [];
      const idx = cur.indexOf(opt);
      if (idx > -1) {
        cur.splice(idx, 1);
      } else {
        if (cur.length >= 3) return a;
        cur.push(opt);
      }
      return { ...a, [q]: cur };
    });
  };

  const addCollege = () => {
    const val = collegeInput.trim();
    if (val && !collegeList.includes(val)) setCollegeList((l) => [...l, val]);
    setCollegeInput('');
  };

  const removeCollege = (i: number) => setCollegeList((l) => l.filter((_, idx) => idx !== i));

  const conf = QUESTIONS[current];
  const hasSelection =
    conf.type === 'single' ? !!answers[current] : true; // multi3/search never block Continue

  const goNext = () => {
    if (onSummary) return;
    if (current < TOTAL) setCurrent((c) => c + 1);
    else setOnSummary(true);
  };
  const goBack = () => {
    if (onSummary) {
      setOnSummary(false);
      return;
    }
    if (current > 1) setCurrent((c) => c - 1);
  };

  const findMatches = () => {
    close();
    router.push('/colleges/recommended');
    toast.success("Thanks! Here are colleges to explore — smart matching is coming soon.");
  };

  const pct = onSummary ? 100 : Math.round(((current - 1) / TOTAL) * 100);

  const fmt = (q: number): string | null => {
    if (q === 10) return collegeList.length ? collegeList.join(', ') : null;
    const v = answers[q];
    if (Array.isArray(v)) return v.length ? v.join(', ') : null;
    if (q === 4 && v === 'Same State' && stateInput.trim()) return `${v} (${stateInput.trim()})`;
    return (v as string) || null;
  };

  return (
    <div className={cn('fixed inset-0 z-[70] overflow-y-auto', styles.overlay)}>
      <div className={styles.wrap}>
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <button className={styles.closeX} onClick={close} aria-label="Close quiz">
              ×
            </button>
            <h1>Find Your College Match</h1>
          </div>
          <div className={styles.pct}>{pct}%</div>
        </div>

        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${pct}%` }} />
        </div>
        <p className={styles.progressCaption}>
          {onSummary ? 'All done — review your answers below.' : 'Each question gets your matches more accurate.'}
        </p>

        {!onSummary && (
          <div className={cn(styles.qcard, styles.active)}>
            <p className={styles.stepLabel}>
              Question {current} of {TOTAL}
            </p>
            <p className={styles.qtitle}>{conf.title}</p>
            {conf.sub && <p className={styles.qsub}>{conf.sub}</p>}

            {conf.type === 'search' ? (
              <>
                <div className={styles.field}>
                  <label>College name</label>
                  <input
                    type="text"
                    placeholder="Type a college name and press Enter..."
                    value={collegeInput}
                    onChange={(e) => setCollegeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCollege();
                      }
                    }}
                  />
                </div>
                <div className={styles.chipRow}>
                  {collegeList.map((name, i) => (
                    <div key={name} className={styles.chip}>
                      <span>{name}</span>
                      <button type="button" onClick={() => removeCollege(i)} aria-label={`Remove ${name}`}>
                        ×
                      </button>
                    </div>
                  ))}
                </div>
                <p className={styles.skipNote}>None yet? No problem — skip ahead.</p>
              </>
            ) : (
              <>
                <div className={styles.optStack}>
                  {conf.options!.map((opt) => {
                    const isMulti = conf.type === 'multi3';
                    const selectedList = isMulti ? ((answers[current] as string[]) ?? []) : [];
                    const isSelected = isMulti ? selectedList.includes(opt) : answers[current] === opt;
                    const atLimit = isMulti && selectedList.length >= 3 && !isSelected;
                    return (
                      <button
                        key={opt}
                        type="button"
                        className={cn(styles.opt, isSelected && styles.selected, atLimit && styles.disabledLimit)}
                        onClick={() => (isMulti ? toggleMulti(current, opt) : selectSingle(current, opt))}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
                {conf.type === 'multi3' && (
                  <p className={styles.limitNote}>
                    <b>{((answers[current] as string[]) ?? []).length}</b>/3 selected
                  </p>
                )}
                {current === 4 && (
                  <div className={cn(styles.subfield, answers[4] === 'Same State' && styles.show)}>
                    <div className={styles.field}>
                      <label>State</label>
                      <input
                        type="text"
                        placeholder="e.g. Maharashtra"
                        value={stateInput}
                        onChange={(e) => setStateInput(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {onSummary && (
          <div className={cn(styles.summary, styles.active)}>
            <p className={styles.stepLabel}>Summary</p>
            <p className={styles.qtitle}>Here&apos;s what we&apos;ve got</p>
            <p className={styles.qsub}>Check it over, then we&apos;ll find your matches.</p>
            <div>
              {Array.from({ length: TOTAL }, (_, i) => i + 1).map((q) => {
                const val = fmt(q);
                return (
                  <div key={q} className={styles.sumRow}>
                    <div className={styles.q}>{SUMMARY_LABELS[q]}</div>
                    <div className={cn(styles.a, !val && styles.empty)}>{val || 'Skipped'}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={styles.navStack}>
          <button
            className={styles.backLink}
            onClick={goBack}
            style={{ visibility: !onSummary && current === 1 ? 'hidden' : 'visible' }}
          >
            ← Back
          </button>
          <button
            className={styles.cta}
            disabled={!onSummary && !hasSelection}
            onClick={onSummary ? findMatches : goNext}
          >
            {onSummary ? 'Find My Matches' : current === TOTAL ? 'See Summary' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  );
}

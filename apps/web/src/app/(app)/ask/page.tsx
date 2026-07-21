'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, MessageCircleQuestion } from 'lucide-react';
import { PageHero } from '@/components/page-hero';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuthStore } from '@/stores/auth.store';
import { useSubmitComplaint } from '@/hooks/use-complaints';

export default function AskPage() {
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  const [college, setCollege] = useState('');
  const [question, setQuestion] = useState('');
  const [sent, setSent] = useState(false);
  const submit = useSubmitComplaint();

  if (!loggedIn) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <b className="block font-display text-lg">Sign in to ask a verified student</b>
          <p className="mt-1 text-muted-foreground">Your question goes straight to our team — no brochures, no spam.</p>
          <div className="mt-5 flex justify-center gap-3">
            <Button asChild variant="outline"><Link href="/login">Sign in</Link></Button>
            <Button asChild><Link href="/signup">Sign up</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={CheckCircle2}
          title="We've got your question"
          description="Our team will review it and follow up soon — no charges, ever."
          action={
            <Button variant="outline" onClick={() => { setSent(false); setCollege(''); setQuestion(''); }}>
              Ask another question
            </Button>
          }
        />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    const body = college.trim()
      ? `[Admission Question] College: ${college.trim()}\n\n${question.trim()}`
      : `[Admission Question]\n\n${question.trim()}`;
    submit.mutate({ body }, { onSuccess: () => setSent(true) });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <PageHero
        eyebrow="Ask a verified student"
        title="Get honest"
        accent="answers."
        sub="Application forms charge you for answers. Ask us directly instead — no charges, ever."
      />

      <form onSubmit={handleSubmit} className="space-y-4 rounded-3xl border border-border bg-card p-6">
        <div>
          <label htmlFor="college" className="text-sm font-semibold">
            Which college? <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="college"
            className="mt-1.5"
            placeholder="e.g. VIT, Bennett University…"
            value={college}
            onChange={(e) => setCollege(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="question" className="text-sm font-semibold">
            Your question
          </label>
          <Textarea
            id="question"
            className="mt-1.5 min-h-[140px]"
            placeholder="Ask about placements, curriculum, campus life, fees, scholarships…"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full gap-2" disabled={submit.isPending || !question.trim()}>
          <MessageCircleQuestion className="h-4 w-4" />
          {submit.isPending ? 'Sending…' : 'Send question'}
        </Button>
      </form>
    </div>
  );
}

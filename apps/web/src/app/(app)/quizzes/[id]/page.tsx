'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { useAuthStore } from '@/stores/auth.store';
import { useQuizForTaking, useSubmitQuizAttempt, type QuizAttempt } from '@/hooks/use-quizzes';

export default function TakeQuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const loggedIn = useAuthStore((s) => !!s.accessToken);
  const { data: quiz, isLoading } = useQuizForTaking(id);
  const submit = useSubmitQuizAttempt();

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<QuizAttempt | null>(null);

  if (isLoading) return <Skeleton className="mx-auto h-72 w-full max-w-2xl" />;
  if (!quiz) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState icon={HelpCircle} title="Quiz not found" description="It may have been unpublished." />
      </div>
    );
  }

  const allAnswered = quiz.questions.every((q) => answers[q.id] !== undefined);

  const onSubmit = () => {
    submit.mutate(
      { quizId: id, answers },
      {
        onSuccess: (attempt) => setResult(attempt),
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link
        href="/quizzes"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Quizzes
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        {quiz.description && <p className="text-muted-foreground">{quiz.description}</p>}
      </div>

      {result ? (
        <Card className="border-green/40 bg-green-soft/40">
          <CardContent className="flex items-center gap-3 p-5">
            <span className="grid h-9 w-9 flex-none place-items-center rounded-full bg-green text-white">
              <CheckCircle2 className="h-5 w-5" />
            </span>
            <div>
              <p className="font-semibold">
                You scored {result.score} / {result.totalQuestions}
              </p>
              <p className="text-sm text-muted-foreground">
                {Math.round((result.score / result.totalQuestions) * 100)}% correct
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {!loggedIn && (
            <Card className="border-dashed">
              <CardContent className="p-4 text-sm text-muted-foreground">
                <Link href="/login" className="font-semibold text-primary hover:underline">
                  Sign in
                </Link>{' '}
                to submit your answers and see your score.
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {quiz.questions.map((q, i) => (
              <Card key={q.id}>
                <CardContent className="space-y-2 p-4">
                  <p className="font-semibold">
                    {i + 1}. {q.prompt}
                  </p>
                  <div className="space-y-1.5">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className="flex cursor-pointer items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name={q.id}
                          checked={answers[q.id] === oi}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: oi }))}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button disabled={!loggedIn || !allAnswered || submit.isPending} onClick={onSubmit}>
            Submit answers
          </Button>
        </>
      )}
    </div>
  );
}

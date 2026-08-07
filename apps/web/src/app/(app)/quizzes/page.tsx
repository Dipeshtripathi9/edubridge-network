'use client';

import Link from 'next/link';
import { HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { usePublishedQuizzes } from '@/hooks/use-quizzes';

export default function QuizzesPage() {
  const { data: quizzes, isLoading } = usePublishedQuizzes();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <HelpCircle className="h-6 w-6 text-primary" /> Quizzes
        </h1>
        <p className="text-muted-foreground">Test what you&apos;ve learned — auto-graded instantly.</p>
      </div>

      {isLoading ? (
        <Skeleton className="h-32 w-full" />
      ) : !quizzes?.length ? (
        <EmptyState icon={HelpCircle} title="No quizzes available yet" description="Check back soon." />
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <Link key={quiz.id} href={`/quizzes/${quiz.id}`}>
              <Card className="transition-colors hover:border-primary/40">
                <CardContent className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="font-semibold">{quiz.title}</p>
                    {quiz.description && <p className="text-sm text-muted-foreground">{quiz.description}</p>}
                  </div>
                  <Badge variant="outline">
                    {quiz._count.questions} question{quiz._count.questions === 1 ? '' : 's'}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

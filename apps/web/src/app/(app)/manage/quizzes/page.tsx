'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { QuizQuestionEditor } from '@/components/quizzes/quiz-question-editor';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import {
  useAdminQuiz,
  useAdminQuizzes,
  useCreateQuiz,
  useUpdateQuiz,
  type QuizAdmin,
} from '@/hooks/use-quizzes';

function QuizCard({ summary }: { summary: QuizAdmin }) {
  const [open, setOpen] = useState(false);
  const { data: quiz, isLoading } = useAdminQuiz(open ? summary.id : undefined);
  const updateQuiz = useUpdateQuiz();

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-semibold">{summary.title}</p>
            {summary.description && <p className="text-sm text-muted-foreground">{summary.description}</p>}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {summary._count?.questions ?? 0} question{summary._count?.questions === 1 ? '' : 's'} ·{' '}
              {summary._count?.attempts ?? 0} attempt{summary._count?.attempts === 1 ? '' : 's'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant={summary.isPublished ? 'default' : 'outline'}>
              {summary.isPublished ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpen((o) => !o)}>
            {open ? 'Hide questions' : 'Manage questions'}{' '}
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="sm"
            disabled={updateQuiz.isPending}
            onClick={() =>
              updateQuiz.mutate(
                { id: summary.id, isPublished: !summary.isPublished },
                {
                  onSuccess: () => toast.success(summary.isPublished ? 'Unpublished' : 'Published'),
                  onError: (e) => toast.error((e as Error).message),
                },
              )
            }
          >
            {summary.isPublished ? 'Unpublish' : 'Publish'}
          </Button>
        </div>

        {open && (
          <div className="border-t border-border pt-3">
            {isLoading || !quiz ? <Skeleton className="h-24 w-full" /> : <QuizQuestionEditor quiz={quiz} />}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CreateQuizPanel() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const createQuiz = useCreateQuiz();

  const onSubmit = () => {
    if (!title.trim()) {
      toast.error('Give the quiz a title');
      return;
    }
    createQuiz.mutate(
      { title: title.trim(), description: description.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Quiz created as a draft — add questions, then publish it');
          setTitle('');
          setDescription('');
          setOpen(false);
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
        New quiz
      </Button>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <Input placeholder="Quiz title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Input
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="flex gap-2">
          <Button size="sm" disabled={createQuiz.isPending} onClick={onSubmit}>
            Create
          </Button>
          <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManageQuizzesPage() {
  const router = useRouter();
  const hydrated = useAuthStore((s) => s.hydrated);
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'ADMIN' || role === 'SUPER_ADMIN';

  const { data: quizzes, isLoading } = useAdminQuizzes();

  useEffect(() => {
    if (hydrated && !isAdmin) router.replace('/home');
  }, [hydrated, isAdmin, router]);

  if (!hydrated || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <HelpCircle className="h-6 w-6 text-primary" /> Quizzes · Manage
        </h1>
        <p className="text-muted-foreground">
          Create quizzes, add questions, and publish them — auto-graded server-side.
        </p>
      </div>

      <CreateQuizPanel />

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : !quizzes?.length ? (
        <EmptyState icon={HelpCircle} title="No quizzes yet" description="Create your first quiz above." />
      ) : (
        <div className="space-y-3">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} summary={quiz} />
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  useAddQuizQuestion,
  useDeleteQuizQuestion,
  type QuizAdmin,
} from '@/hooks/use-quizzes';

export function QuizQuestionEditor({ quiz }: { quiz: QuizAdmin }) {
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [correctOption, setCorrectOption] = useState(0);

  const addQuestion = useAddQuizQuestion();
  const deleteQuestion = useDeleteQuizQuestion();

  const resetForm = () => {
    setPrompt('');
    setOptions(['', '']);
    setCorrectOption(0);
  };

  const onAddOption = () => setOptions((o) => [...o, '']);
  const onRemoveOption = (i: number) => {
    setOptions((o) => o.filter((_, idx) => idx !== i));
    if (correctOption >= options.length - 1) setCorrectOption(0);
  };

  const onSubmit = () => {
    const trimmed = options.map((o) => o.trim()).filter(Boolean);
    if (!prompt.trim() || trimmed.length < 2) {
      toast.error('Add a prompt and at least 2 non-empty options');
      return;
    }
    addQuestion.mutate(
      { quizId: quiz.id, prompt: prompt.trim(), options: trimmed, correctOption },
      {
        onSuccess: () => {
          toast.success('Question added');
          resetForm();
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <div className="space-y-4">
      {quiz.questions && quiz.questions.length > 0 && (
        <div className="space-y-2">
          {quiz.questions.map((q, i) => (
            <div key={q.id} className="rounded-lg border border-border bg-background p-3">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold">
                  {i + 1}. {q.prompt}
                </p>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 flex-none"
                  disabled={deleteQuestion.isPending}
                  onClick={() =>
                    deleteQuestion.mutate(
                      { quizId: quiz.id, questionId: q.id },
                      { onError: (e) => toast.error((e as Error).message) },
                    )
                  }
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {q.options.map((opt, oi) => (
                  <Badge key={oi} variant={oi === q.correctOption ? 'default' : 'outline'}>
                    {opt}
                    {oi === q.correctOption && ' ✓'}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2 rounded-lg border border-dashed border-border p-3">
        <p className="text-xs font-semibold text-muted-foreground">Add a question</p>
        <Input placeholder="Question prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <div className="space-y-1.5">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="radio"
                name="correctOption"
                checked={correctOption === i}
                onChange={() => setCorrectOption(i)}
                aria-label={`Mark option ${i + 1} correct`}
              />
              <Input
                placeholder={`Option ${i + 1}`}
                value={opt}
                onChange={(e) => setOptions((o) => o.map((v, idx) => (idx === i ? e.target.value : v)))}
                className="flex-1"
              />
              {options.length > 2 && (
                <Button size="icon" variant="ghost" className="h-8 w-8 flex-none" onClick={() => onRemoveOption(i)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onAddOption}>
            Add option
          </Button>
          <Button size="sm" disabled={addQuestion.isPending} onClick={onSubmit}>
            Add question
          </Button>
        </div>
        <p className="text-[11px] text-muted-foreground">Select the radio button next to the correct answer.</p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  useSubmitVirtualInternshipFeedback,
  useVirtualInternshipFeedback,
} from '@/hooks/use-virtual-internship';
import { cn } from '@/lib/utils';

export function VirtualInternshipFeedbackForm({ enrollmentId }: { enrollmentId: string }) {
  const { data: feedback, isLoading } = useVirtualInternshipFeedback(enrollmentId);
  const submit = useSubmitVirtualInternshipFeedback();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);

  if (isLoading) return null;

  const submitted = feedback && !editing;
  const displayRating = submitted ? feedback.rating : rating;

  const onSubmit = () => {
    if (rating < 1) {
      toast.error('Pick a star rating first');
      return;
    }
    submit.mutate(
      { id: enrollmentId, rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          toast.success('Thanks for the feedback!');
          setEditing(false);
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div>
          <p className="font-semibold">{submitted ? 'Your feedback' : 'How was your experience?'}</p>
          <p className="text-sm text-muted-foreground">
            {submitted ? 'You can update this any time.' : 'Rate the track — it helps us improve.'}
          </p>
        </div>

        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={submitted}
              onMouseEnter={() => !submitted && setHoverRating(n)}
              onMouseLeave={() => !submitted && setHoverRating(0)}
              onClick={() => !submitted && setRating(n)}
              className={cn('disabled:cursor-default', !submitted && 'cursor-pointer')}
              aria-label={`${n} star${n > 1 ? 's' : ''}`}
            >
              <Star
                className={cn(
                  'h-6 w-6 transition-colors',
                  n <= (hoverRating || displayRating)
                    ? 'fill-marigold text-marigold'
                    : 'text-muted-foreground',
                )}
              />
            </button>
          ))}
        </div>

        {submitted ? (
          <>
            {feedback.comment && <p className="text-sm text-muted-foreground">“{feedback.comment}”</p>}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setRating(feedback.rating);
                setComment(feedback.comment ?? '');
                setEditing(true);
              }}
            >
              Edit feedback
            </Button>
          </>
        ) : (
          <>
            <Textarea
              placeholder="Anything you'd like to add? (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
            />
            <Button disabled={submit.isPending || rating < 1} onClick={onSubmit}>
              Submit feedback
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}

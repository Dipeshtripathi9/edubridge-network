'use client';

import { useState } from 'react';
import { CheckCircle2, Headset, Send } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { SUPPORT_TOPICS, useSubmitManagerSupport } from '@/hooks/use-leadership';

// Shown only in a community manager's leadership dashboard: a direct line to the
// admin team for a referral, personal mentorship, or any question.
export function ContactAdminTeam() {
  const submit = useSubmitManagerSupport();
  const [topic, setTopic] = useState<string>('REFERRAL');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const active = SUPPORT_TOPICS.find((t) => t.value === topic);

  const onSubmit = () => {
    if (!message.trim()) {
      toast.error('Write a short message for the admin team');
      return;
    }
    submit.mutate(
      { topic, message: message.trim() },
      {
        onSuccess: () => {
          setSent(true);
          setMessage('');
          toast.success('Sent to the admin team — they’ll get back to you.');
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-accent/10">
      <CardContent className="space-y-4 p-5">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent-foreground text-primary-foreground shadow-sm">
            <Headset className="h-5 w-5" />
          </span>
          <div>
            <h3 className="font-semibold">Contact the Admin Team</h3>
            <p className="text-sm text-muted-foreground">
              As a community manager you get a direct line to us — for a referral, personal
              mentorship, or anything you need help with.
            </p>
          </div>
        </div>

        {sent ? (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            Your request was sent to the admin team. You can send another anytime.
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSent(false)}>
              New request
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              {SUPPORT_TOPICS.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTopic(t.value)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
                    topic === t.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-accent',
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {active && <p className="text-xs text-muted-foreground">{active.hint}</p>}
            <Textarea
              rows={4}
              placeholder={
                topic === 'REFERRAL'
                  ? 'Which role/company would you like a referral for? Add any context…'
                  : topic === 'MENTORSHIP'
                    ? 'What would you like mentorship on? (career, growth, your community…)'
                    : 'How can the admin team help?'
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <div className="flex justify-end">
              <Button onClick={onSubmit} disabled={submit.isPending}>
                <Send className="h-4 w-4" /> Send to admin team
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

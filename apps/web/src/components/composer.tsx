'use client';

import { useState } from 'react';
import { ListChecks, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useCreatePost } from '@/hooks/use-posts';

export function Composer({ slug }: { slug: string }) {
  const create = useCreatePost(slug);
  const [body, setBody] = useState('');
  const [pollMode, setPollMode] = useState(false);
  const [options, setOptions] = useState(['', '']);

  const submit = () => {
    if (!body.trim()) return;
    const hashtags = Array.from(body.matchAll(/#(\w+)/g)).map((m) => m[1]);
    const payload: Record<string, unknown> = { body, hashtags };
    if (pollMode) {
      const opts = options.map((o) => o.trim()).filter(Boolean);
      if (opts.length < 2) {
        toast.error('Add at least two poll options');
        return;
      }
      payload.type = 'POLL';
      payload.poll = { question: body, options: opts };
    }
    create.mutate(payload, {
      onSuccess: () => {
        setBody('');
        setOptions(['', '']);
        setPollMode(false);
        toast.success('Posted!');
      },
      onError: (e) => toast.error((e as Error).message),
    });
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <Textarea
          placeholder={pollMode ? 'Ask a question…' : "Share something with the community…"}
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {pollMode && (
          <div className="space-y-2">
            {options.map((opt, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={(e) => {
                    const next = [...options];
                    next[i] = e.target.value;
                    setOptions(next);
                  }}
                />
                {options.length > 2 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            {options.length < 6 && (
              <Button variant="ghost" size="sm" onClick={() => setOptions([...options, ''])}>
                + Add option
              </Button>
            )}
          </div>
        )}
        <div className="flex items-center justify-between">
          <Button
            variant={pollMode ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setPollMode((v) => !v)}
          >
            <ListChecks className="h-4 w-4" />
            Poll
          </Button>
          <Button size="sm" onClick={submit} disabled={create.isPending}>
            <Send className="h-4 w-4" />
            Post
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

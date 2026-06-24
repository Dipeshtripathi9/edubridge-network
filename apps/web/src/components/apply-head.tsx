'use client';

import { useState } from 'react';
import { Crown } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { HEAD_ROLES, useApplyHead, useMyHeadApplications } from '@/hooks/use-heads';

export function ApplyHead({
  slug,
  hiringOpen = false,
  hiringNote,
}: {
  slug: string;
  hiringOpen?: boolean;
  hiringNote?: string | null;
}) {
  const apply = useApplyHead(slug);
  const { data: mine } = useMyHeadApplications();
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState<string>('CAMPUS_LEAD');
  const [pitch, setPitch] = useState('');

  const pending = mine?.find((a) => a.community.slug === slug && a.status === 'PENDING');

  // Hiring closed (and no pending app of mine) → nothing to show.
  if (!hiringOpen && !pending) return null;

  if (pending) {
    return (
      <Card className="border-amber-500/40 bg-amber-500/5">
        <CardContent className="p-4 text-sm">
          Your application for <strong>{pending.requestedRole.replace(/_/g, ' ').toLowerCase()}</strong> is pending admin review.
        </CardContent>
      </Card>
    );
  }

  if (!open) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4">
          <div>
            <p className="text-sm font-medium">This community is hiring managers 🎉</p>
            {hiringNote && <p className="text-sm text-muted-foreground">{hiringNote}</p>}
          </div>
          <Button variant="outline" onClick={() => setOpen(true)}>
            <Crown className="h-4 w-4" /> Apply to lead
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <p className="text-sm font-medium">Apply for a leadership role</p>
        <div className="flex flex-wrap gap-2">
          {HEAD_ROLES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRole(r.value)}
              className={cn(
                'rounded-full border px-3 py-1 text-sm',
                role === r.value ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-accent',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
        <Textarea placeholder="Why should you lead? (optional)" value={pitch} onChange={(e) => setPitch(e.target.value)} />
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            disabled={apply.isPending}
            onClick={() =>
              apply.mutate(
                { requestedRole: role, pitch: pitch || undefined },
                {
                  onSuccess: () => {
                    toast.success('Application submitted for admin review');
                    setOpen(false);
                  },
                  onError: (e) => toast.error((e as Error).message),
                },
              )
            }
          >
            Submit application
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

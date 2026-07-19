'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { OpportunityCard } from '@/components/opportunity-card';
import { isSafeHttpUrl, uniqueById } from '@/lib/utils';
import {
  useDecideOpportunity,
  useOpportunities,
  usePendingOpportunities,
  useSubmitOpportunity,
} from '@/hooks/use-opportunities';

export function OpportunitiesSection({
  communityId,
  canModerate,
  isMember = false,
  managersOnly = false,
}: {
  communityId: string;
  canModerate: boolean;
  isMember?: boolean;
  /** Startup communities: only admins & this community's managers may post. */
  managersOnly?: boolean;
}) {
  const { data, isLoading } = useOpportunities({ communityId });
  const submit = useSubmitOpportunity(communityId);
  const pending = usePendingOpportunities(communityId, canModerate);
  const decide = useDecideOpportunity(communityId);
  const items = uniqueById(data?.pages.flatMap((p) => p.data) ?? []);

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [org, setOrg] = useState('');
  const [desc, setDesc] = useState('');
  const [type, setType] = useState('INTERNSHIP');
  const [url, setUrl] = useState('');

  const onSubmit = () => {
    if (!title.trim() || !desc.trim()) {
      toast.error('Add a title and description');
      return;
    }
    if (url.trim() && !isSafeHttpUrl(url.trim())) {
      toast.error('Apply link must start with http:// or https://');
      return;
    }
    submit.mutate(
      { type, title, organization: org || undefined, description: desc, applyUrl: url || undefined },
      {
        onSuccess: () => {
          toast.success('Submitted — pending admin/manager approval');
          setOpen(false);
          setTitle('');
          setOrg('');
          setDesc('');
          setUrl('');
        },
        onError: (e) => toast.error((e as Error).message),
      },
    );
  };

  // In startup communities only admins & managers can post opportunities.
  // Managers/admins always; regular members only in non-managers-only communities.
  const canPost = canModerate || (isMember && !managersOnly);

  return (
    <div className="space-y-4">
      {!canPost ? (
        <p className="text-sm text-muted-foreground">
          {!isMember
            ? 'Join the community to post opportunities.'
            : "Only admins & this community's managers can post opportunities here."}
        </p>
      ) : !open ? (
        <Button variant="outline" onClick={() => setOpen(true)}>
          Submit an opportunity
        </Button>
      ) : (
        <Card>
          <CardContent className="space-y-2 p-4">
            <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
            <Input placeholder="Organization" value={org} onChange={(e) => setOrg(e.target.value)} />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-10 w-full rounded-md border border-input bg-background px-2 text-sm"
            >
              {['INTERNSHIP', 'SCHOLARSHIP', 'COMPETITION', 'FELLOWSHIP', 'RESEARCH'].map((t) => (
                <option key={t} value={t}>
                  {t.toLowerCase()}
                </option>
              ))}
            </select>
            <Textarea placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Input placeholder="Apply URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} />
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={onSubmit} disabled={submit.isPending}>
                Submit for approval
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {canModerate && (pending.data?.length ?? 0) > 0 && (
        <Card className="border-amber-500/40 bg-amber-500/5">
          <CardContent className="space-y-2 p-4">
            <p className="text-sm font-semibold">Pending approval ({pending.data!.length})</p>
            {pending.data!.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-2 text-sm">
                <span>
                  {o.title} <Badge variant="secondary">{o.type.toLowerCase()}</Badge>
                </span>
                <div className="flex gap-1">
                  <Button size="sm" variant="outline" onClick={() => decide.mutate({ id: o.id, approve: false }, { onSuccess: () => toast.success('Rejected') })}>
                    Reject
                  </Button>
                  <Button size="sm" onClick={() => decide.mutate({ id: o.id, approve: true }, { onSuccess: () => toast.success('Approved & published') })}>
                    Approve
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">No opportunities yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {items.map((o) => (
            <OpportunityCard key={o.id} opportunity={o} canModerate={canModerate} />
          ))}
        </div>
      )}
    </div>
  );
}

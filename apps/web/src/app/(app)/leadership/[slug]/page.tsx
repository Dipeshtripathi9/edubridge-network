'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ArrowLeft, LifeBuoy, Megaphone, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { CommunityMonitor } from '@/components/community-monitor';
import { isCommunityManager, useCommunity } from '@/hooks/use-communities';
import { useCommunityBroadcast } from '@/hooks/use-notifications';
import { useSubmitComplaint } from '@/hooks/use-complaints';
import { useAuthStore } from '@/stores/auth.store';

const roleLabel = (r: string) => r.replace(/_/g, ' ').toLowerCase();

function RaiseIssue({ communityId }: { communityId: string }) {
  const submit = useSubmitComplaint();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <LifeBuoy className="h-4 w-4" /> Raise an issue with admin
      </Button>
    );
  }
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="text-sm font-medium">Report an issue directly to the platform admin</p>
        <Textarea
          placeholder="Describe the issue you're facing as a manager…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!body.trim() || submit.isPending}
            onClick={() =>
              submit.mutate(
                { body: body.trim(), communityId },
                {
                  onSuccess: () => {
                    toast.success('Sent to the platform admin');
                    setOpen(false);
                    setBody('');
                  },
                  onError: (e) => toast.error((e as Error).message),
                },
              )
            }
          >
            Send to admin
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function BroadcastToCommunity({ communityId }: { communityId: string }) {
  const broadcast = useCommunityBroadcast(communityId);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Megaphone className="h-4 w-4" /> Broadcast to members
      </Button>
    );
  }
  return (
    <Card>
      <CardContent className="space-y-2 p-4">
        <p className="text-sm font-medium">Notify every member of this community</p>
        <Input placeholder="Title (e.g. New event this Friday)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea
          placeholder="Message (optional)"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!title.trim() || broadcast.isPending}
            onClick={() =>
              broadcast.mutate(
                { title: title.trim(), body: body.trim() || undefined },
                {
                  onSuccess: (r) => {
                    toast.success(`Sent to ${r.sent} members`);
                    setOpen(false);
                    setTitle('');
                    setBody('');
                  },
                  onError: (e) => toast.error((e as Error).message),
                },
              )
            }
          >
            Send broadcast
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ManageCommunityPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: community, isLoading } = useCommunity(slug);
  const globalRole = useAuthStore((s) => s.user?.role);
  const canManage =
    isCommunityManager(community?.myRole) ||
    globalRole === 'ADMIN' ||
    globalRole === 'SUPER_ADMIN' ||
    globalRole === 'MODERATOR';

  if (isLoading) return <Skeleton className="mx-auto h-72 max-w-4xl" />;
  if (!community) return <p className="py-16 text-center text-muted-foreground">Community not found.</p>;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <Link href="/leadership">
          <ArrowLeft className="h-4 w-4" /> Leadership
        </Link>
      </Button>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ShieldCheck className="h-6 w-6 text-primary" /> {community.name}
          </h1>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            Managing as
            <Badge className="capitalize">{roleLabel(community.myRole ?? 'manager')}</Badge>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href={`/communities/${slug}`}>Open community</Link>
        </Button>
      </div>

      {canManage && (
        <div className="flex flex-wrap gap-2">
          <BroadcastToCommunity communityId={community.id} />
          <RaiseIssue communityId={community.id} />
        </div>
      )}

      {canManage ? (
        <CommunityMonitor slug={slug} communityId={community.id} myRole={community.myRole} />
      ) : (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            You don&apos;t hold a leadership post in this community.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

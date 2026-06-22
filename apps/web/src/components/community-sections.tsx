'use client';

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Megaphone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Composer } from '@/components/composer';
import { PostCard } from '@/components/post-card';
import { ResourceCard } from '@/components/resource-card';
import { ResourceUpload } from '@/components/resource-upload';
import { OpportunityCard } from '@/components/opportunity-card';
import { useFeed } from '@/hooks/use-posts';
import { useResources } from '@/hooks/use-resources';
import {
  useDecideOpportunity,
  useOpportunities,
  usePendingOpportunities,
  useSubmitOpportunity,
} from '@/hooks/use-opportunities';

function FeedSection({
  slug,
  section,
  canModerate,
  empty,
}: {
  slug: string;
  section: 'ANNOUNCEMENTS' | 'DISCUSSION' | 'POLLS';
  canModerate: boolean;
  empty: string;
}) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useFeed(slug, section);
  const posts = data?.pages.flatMap((p) => p.data) ?? [];
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  if (!posts.length) return <p className="py-10 text-center text-muted-foreground">{empty}</p>;
  return (
    <div className="space-y-4">
      {posts.map((p) => (
        <PostCard key={p.id} post={p} slug={slug} canModerate={canModerate} />
      ))}
      {hasNextPage && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? 'Loading…' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}

function ResourcesSection({ slug, communityId }: { slug: string; communityId: string }) {
  void slug;
  const { data, isLoading } = useResources({ communityId });
  const items = data?.pages.flatMap((p) => p.data) ?? [];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Anyone can upload — admins/heads monitor.</p>
        <ResourceUpload communityId={communityId} />
      </div>
      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : items.length === 0 ? (
        <p className="py-10 text-center text-muted-foreground">No resources yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function OpportunitiesSection({
  communityId,
  canModerate,
}: {
  communityId: string;
  canModerate: boolean;
}) {
  const { data, isLoading } = useOpportunities({ communityId });
  const submit = useSubmitOpportunity(communityId);
  const pending = usePendingOpportunities(communityId, canModerate);
  const decide = useDecideOpportunity(communityId);
  const items = data?.pages.flatMap((p) => p.data) ?? [];

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

  return (
    <div className="space-y-4">
      {!open ? (
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
            <OpportunityCard key={o.id} opportunity={o} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CommunitySections({
  slug,
  communityId,
  canModerate,
  collegeSlug,
}: {
  slug: string;
  communityId: string;
  canModerate: boolean;
  collegeSlug?: string | null;
}) {
  return (
    <Tabs defaultValue="announcements">
      <TabsList className="flex-wrap">
        <TabsTrigger value="announcements">Announcements</TabsTrigger>
        <TabsTrigger value="resources">Resources</TabsTrigger>
        <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
        <TabsTrigger value="discussion">Discussion</TabsTrigger>
        <TabsTrigger value="polls">Polls</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>

      <TabsContent value="announcements" className="space-y-4">
        {canModerate ? (
          <Composer slug={slug} kind="ANNOUNCEMENT" placeholder="Post an announcement…" />
        ) : (
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <Megaphone className="h-4 w-4" /> Only community heads can post announcements.
          </p>
        )}
        <FeedSection slug={slug} section="ANNOUNCEMENTS" canModerate={canModerate} empty="No announcements yet." />
      </TabsContent>

      <TabsContent value="resources">
        <ResourcesSection slug={slug} communityId={communityId} />
      </TabsContent>

      <TabsContent value="opportunities">
        <OpportunitiesSection communityId={communityId} canModerate={canModerate} />
      </TabsContent>

      <TabsContent value="discussion" className="space-y-4">
        <Composer slug={slug} placeholder="Start a discussion…" />
        <FeedSection slug={slug} section="DISCUSSION" canModerate={canModerate} empty="No discussions yet — start one!" />
      </TabsContent>

      <TabsContent value="polls" className="space-y-4">
        <Composer slug={slug} placeholder="Ask the community…" />
        <FeedSection slug={slug} section="POLLS" canModerate={canModerate} empty="No polls yet." />
      </TabsContent>

      <TabsContent value="reviews">
        {collegeSlug ? (
          <Card>
            <CardContent className="flex items-center justify-between p-4">
              <p className="text-sm text-muted-foreground">Verified students can review this college.</p>
              <Button asChild size="sm">
                <Link href={`/reviews/${collegeSlug}`}>Open reviews</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <p className="py-10 text-center text-muted-foreground">
            Reviews are available on college communities.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
